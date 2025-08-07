import React, { useState } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,TextInput,Image,ScrollView,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import { addPost } from '../features/PostsSlice';
import uuid from 'react-native-uuid';
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

    // Find or create user
    const usersCollection = database.get<User>('users');
    const users = await usersCollection.query(Q.where('username', 'Jeevith')).fetch();
    let user: User;
    if (users.length === 0) {
      user = await database.write(async () => {
        return await usersCollection.create(u => {
          u._raw.id = uuid.v4().toString();
          u.username = 'Jeevith';
          u.avatarUri = 'https://i.pravatar.cc/150?img=65';
        });
      });
    } else {
      user = users[0];
    }

    const newPost = {
      id: uuid.v4().toString(),
      contentUri: media.uri,
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
      await database.write(async () => {
        await postsCollection.create(post => {
          post._raw.id = newPost.id;
          post.contentUri = newPost.contentUri;
          post.userId = newPost.userId;
          post.likes = newPost.likes;
          post.caption = newPost.caption;
          post.liked = newPost.liked;
          post.saved = newPost.saved;
          post.comments = newPost.comments;
          post.shares = newPost.shares;
          post.contentType = newPost.contentType;
        });
      });
    } catch (error) {
      console.error('Failed to save post to WatermelonDB:', error);
      Alert.alert('Error', 'Failed to save post.');
      return;
    }

    dispatch(addPost(newPost));
    setCaption('');
    setMedia(null);
    Alert.alert('Posted!', 'Your post has been added.');
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