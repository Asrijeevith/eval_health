import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleLike,
  toggleSave,
  toggleComment,
  toggleShare,
} from '../features/PostsSlice';
import { RootState } from '../features/Store';
import { PostType } from '../types/PostType';
import Pdf from 'react-native-pdf';
import Video from 'react-native-video';

const Body = () => {
  const posts = useSelector((state: RootState) => state.posts.posts) as PostType[];
  const dispatch = useDispatch();

  const [visiblePostId, setVisiblePostId] = useState<string | null>(null);

  const viewabilityConfig = {
  viewAreaCoveragePercentThreshold: 70,
  };


  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const firstVisible = viewableItems[0];
    if (firstVisible) {
      setVisiblePostId(firstVisible.item.id);
    }
  }).current;

  const stories = posts.map((post) => ({
    key: post.username,
    avatarUri: post.avatarUri,
  }));

  const renderPost = ({ item }: { item: PostType }) => (
    <View style={styles.postWrapper}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
        <Text style={styles.username}>{item.username}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-v" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {item.contentType === 'image' && (
        <Image
          source={{ uri: item.contentUri }}
          style={styles.postImage}
          resizeMode="contain"
        />
      )}

      {item.contentType === 'video' && (
        <Video
          source={{ uri: item.contentUri}}
          style={styles.postImage}
          controls
          resizeMode="contain"
          paused={visiblePostId !== item.id}
          muted={false}
          repeat={true}
        />
      )}

      {item.contentType === 'pdf' && (
        <View style={styles.pdfContainer}>
          <Pdf
            source={{ uri: item.contentUri }}
          
            style={styles.pdf}
            trustAllCerts={false}
          />
        </View>
      )}

      

      <View style={styles.postFooter}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            onPress={() => dispatch(toggleLike(item.id))}
            style={styles.iconButton}
          >
            <Icon
              name={item.liked ? 'heart' : 'heart-o'}
              size={24}
              color={item.liked ? 'red' : '#000'}
            />
            <Text style={styles.iconText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dispatch(toggleComment(item.id))}
            style={styles.iconButton}
          >
            <Icon name="comment-o" size={24} color="#000" />
            <Text style={styles.iconText}>{item.comments || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dispatch(toggleShare(item.id))}
            style={styles.iconButton}
          >
            <Icon name="share" size={24} color="#000" />
            <Text style={styles.iconText}>{item.shares || 0}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => dispatch(toggleSave(item.id))} style={styles.iconButton2}>
          <Icon
            name={item.saved ? 'bookmark' : 'bookmark-o'}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.postContent}>
        <Text style={styles.postText}>
          {item.username} : {item.caption}
        </Text>
      </View>
    </View>
  );

  const renderStories = () => (
    <View style={styles.storyContainer}>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.storyItem}>
            <Image
              source={{ uri: item.avatarUri }}
              style={styles.storyAvatar}
              resizeMode="cover"
            />
            <Text>{item.key}</Text>
          </View>
        )}
      />
    </View>
  );

  return (
    <FlatList
      ListHeaderComponent={renderStories}
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderPost}
      onViewableItemsChanged={onViewableItemsChanged} 
      viewabilityConfig={viewabilityConfig} 
      showsVerticalScrollIndicator={false}
    />
  );
};

export default Body;

const styles = StyleSheet.create({
  postWrapper: {
    backgroundColor: '#fff',
    marginVertical: 1,
    
    
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  username: {
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  moreButton: {
    marginLeft: 'auto',
  },
  postImage: {
    width: '100%',
    height: 550,
    marginVertical: 4,
    
  },
  postContent: {
    marginBottom: 10,
    padding : 10,
  },
  postText: {
    fontSize: 13,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
  },
  iconButton2: {
    padding: 10,
  },
  iconText: {
    marginLeft: 5,
  },
  storyContainer: {
    backgroundColor: '#1e1e1',
    paddingVertical: 0,
    paddingLeft: 10,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  storyAvatar: {
    width: 88,
    height: 88,
    borderRadius: 88,
    marginBottom: 0,
  },
  pdfContainer: {
    height: 400,
  },
  pdf: {
    flex: 1,
  },
});
