import React, { useState } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,TextInput,Image,ScrollView,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import { addPost } from '../features/PostsSlice';
import uuid from 'react-native-uuid';

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

  const handlePost = () => {
    if (!media?.uri) {
      Alert.alert('No media selected');
      return;
    }

    const contentType = media.type?.includes('video')
      ? 'video'
      : media.type?.includes('pdf')
      ? 'pdf'
      : 'image';

    const newPost = {
      id: uuid.v4().toString(),
      contentUri: media.uri,
      avatarUri: '',
      username: 'Jeevith',
      likes: 0,
      caption,
      liked: false,
      saved: false,
      comments: 0,
      shares: 0,
      contentType,
    };

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
