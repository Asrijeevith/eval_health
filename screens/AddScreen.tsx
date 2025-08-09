import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import { addPost } from '../features/PostsSlice';
import uuid from 'react-native-uuid';
import RNFS from 'react-native-fs';
import database from '../database';
import Post from '../model/post';
import User from '../model/user';
import { Q } from '@nozbe/watermelondb';

const AddScreen = () => {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<Asset | null>(null);

  const dispatch = useDispatch();

  const openCamera = async () => {
    const result = await launchCamera({ mediaType: 'photo' });
    if (result.didCancel) return;
    if (result.assets && result.assets.length > 0) {
      setMedia(result.assets[0]);
    } else {
      Alert.alert('Camera Error', 'Failed to capture image.');
    }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.didCancel) return;
    if (result.assets && result.assets.length > 0) {
      setMedia(result.assets[0]);
    } else {
      Alert.alert('Gallery Error', 'Failed to select image.');
    }
  };

  const handlePost = async () => {
    if (!media?.uri) {
      Alert.alert('No media selected');
      return;
    }

    const contentType = media.type?.includes('video')
      ? 'video'
      : media.type?.includes('pdf')
      ? 'pdf'
      : 'image';

    // Save media to persistent storage
    const postId = uuid.v4().toString();
    const fileName = `${postId}.${contentType === 'image' ? 'jpg' : contentType === 'video' ? 'mp4' : 'pdf'}`;
    const destPath = `${RNFS.DocumentDirectoryPath}/media/${fileName}`;
    console.log('AddScreen: Saving media for post:', postId, 'Source URI:', media.uri, 'Dest:', destPath);

    try {
      // Create media directory if it doesn't exist
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/media`);
      // Copy file to persistent storage
      await RNFS.copyFile(media.uri, destPath);
      console.log('AddScreen: Media copied to:', destPath);
    } catch (error) {
      console.error('AddScreen: Failed to save media:', error);
      Alert.alert('Error', 'Failed to save media.');
      return;
    }

    const contentUri = `file://${destPath}`;

    // Find or create user
    const usersCollection = database.get<User>('users');
    const users = await usersCollection.query(Q.where('username', 'Jeevith')).fetch();
    let user: User;
    if (users.length === 0) {
      console.log('AddScreen: Creating new user...');
      user = await database.write(async () => {
        return await usersCollection.create(u => {
          u._raw.id = uuid.v4().toString();
          u.username = 'Jeevith';
          u.avatarUri = 'https://www.giantbomb.com/a/uploads/square_small/46/462814/3222927-6826564307-latest.jpg'; // Replace with actual avatar URI
        });
      });
      console.log('AddScreen: Created user:', user._raw);
    } else {
      user = users[0];
      console.log('AddScreen: Using existing user:', user._raw);
    }

    const newPost = {
      id: postId,
      contentUri,
      userId: user.id,
      user: {
        id: user.id,
        username: user.username,
        avatarUri: user.avatarUri,
      },
      likes: 0,
      caption,
      liked: false,
      saved: false,
      comments: 0,
      shares: 0,
      contentType: contentType as 'image' | 'video' | 'pdf',
    };

    try {
      const postsCollection = database.get<Post>('posts');
      const createdPost = await database.write(async () => {
        const newPostRecord = await postsCollection.create(record => {
          record._raw.id = newPost.id;
          record.contentUri = newPost.contentUri;
          record.userId = newPost.userId;
          record.likes = newPost.likes;
          record.caption = newPost.caption;
          record.liked = newPost.liked;
          record.saved = newPost.saved;
          record.comments = newPost.comments;
          record.shares = newPost.shares;
          record.contentType = newPost.contentType;
        });
        return newPostRecord;
      });
      console.log('AddScreen: Post created in DB:', createdPost._raw);

      dispatch(addPost(newPost));
      setCaption('');
      setMedia(null);
      Alert.alert('Posted!', 'Your post has been added.');
    } catch (error) {
      console.error('AddScreen: Failed to save post to WatermelonDB:', error);
      Alert.alert('Error', 'Failed to save post.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Icon name="upload" size={50} color="#888" style={styles.icon} />
      <Text style={styles.title}>Create New Post</Text>
      <Text style={styles.description}>
        Upload photos or videos from your gallery or capture using camera.
      </Text>

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.button} onPress={openGallery}>
        <Text style={styles.buttonText}>Choose from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={openCamera}
      >
        <Text style={styles.secondaryButtonText}>Open Camera</Text>
      </TouchableOpacity>

      {media?.uri && (
        <Image source={{ uri: media.uri }} style={styles.previewImage} />
      )}

      <View style={styles.captionContainer}>
        <Text style={styles.captionLabel}>Add a Caption</Text>
        <TextInput
          style={styles.captionInput}
          multiline
          value={caption}
          onChangeText={setCaption}
        />
      </View>

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 30,
    paddingTop: 120,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 0,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f2f2f2',
  },
  secondaryButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginVertical: 20,
  },
  captionContainer: {
    width: '100%',
  },
  captionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f9f9f9',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postButton: {
    marginTop: 25,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  spacer: {
    height: 80,
  },
});