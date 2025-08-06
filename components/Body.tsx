import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
  ViewToken,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  ImageStyle,
} from 'react-native';
import Video from 'react-native-video';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../features/store';
import {
  toggleLike,
  toggleSave,
  toggleComment,
  toggleShare,
  openStoryModal,
  closeStoryModal,
  setPosts,
} from '../features/PostsSlice';
import Icon2 from 'react-native-vector-icons/AntDesign';
import database from '../database';
import Post from '../model/Post';
import { Q } from '@nozbe/watermelondb';


const screenWidth = Dimensions.get('window').width;

const Body = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts);
  const isStoryModalVisible = useSelector(
    (state: RootState) => state.posts.isStoryModalVisible
  );
  const currentStory = useSelector(
    (state: RootState) => state.posts.currentStory
  );

  const [storyIndex, setStoryIndex] = useState(
    posts.findIndex((post) => post.id === currentStory?.id )
  );
  const [visiblePostId, setVisiblePostId] = useState<string | null>(null);
  const [visibleStoryId, setVisibleStoryId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const progress = useRef(new Animated.Value(0)).current;
  const [isPaused, setIsPaused] = useState(false);

  const storyDuration = 30000;

  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = database.get<Post>('posts');
        const fetchedPosts = await postsCollection.query().fetch();
        const postsData = fetchedPosts.map(post => ({
          id: post.id,
          contentUri: post.contentUri,
          avatarUri: post.avatarUri,
          username: post.username,
          likes: post.likes,
          caption: post.caption,
          liked: post.liked,
          saved: post.saved,
          comments: post.comments,
          shares: post.shares,
          contentType: post.contentType as 'image' | 'video' | 'pdf',
        }));
        postsData.reverse();
        dispatch(setPosts(postsData ));
      } catch (error) {
        console.error('Failed to fetch posts from WatermelonDB:', error);
      }
    };
    fetchPosts();
  }, [dispatch]);

  const updatePostInWatermelon = async (postId: string, updates: Partial<Post>) => {
    try {
      const postsCollection = database.get<Post>('posts');
      const post = await postsCollection.query(Q.where('id', postId)).fetch();
      if (post.length > 0) {
        await database.write(async () => {
          await post[0].update(record => {
            Object.assign(record, updates);
          });
        });
      }
    } catch (error) {
      console.error('Failed to update post in WatermelonDB:', error);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setVisiblePostId(viewableItems[0].item.id);
    }
  }).current;

  const onStoryItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      setVisibleStoryId(visibleItem.item.id);

      const newIndex = posts.findIndex(post => post.id === visibleItem.item.id);
      if (newIndex !== -1) {
        setStoryIndex(newIndex); 
      }
    }
  }).current;

  const startProgressBar = () => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: storyDuration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        handleTap({ nativeEvent: { locationX: screenWidth + 1 } });
      }
    });
  };

  const pauseProgress = () => {
    setIsPaused(true);
    progress.stopAnimation();
  };

  const resumeProgress = () => {
    setIsPaused(false);
    startProgressBar();
  };

  useEffect(() => {
    if (isStoryModalVisible) {
      startProgressBar();
    }
    return () => {
      progress.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIndex, isStoryModalVisible]);

  const renderContent = (item: any, isStory = false) => {
    const uri = item.contentUri;
    const isVideo = uri.endsWith('.mp4');
    const isPdf = uri.endsWith('.pdf');
    const shouldPlay = isStory
      ? item.id === visibleStoryId
      : item.id === visiblePostId;

    if (isVideo) {
      return (
        <Video
          source={{ uri }}
          style={styles.media}
          resizeMode="cover"
          controls={isStory ? false : true}
          paused={!shouldPlay}
          repeat
        />
      );
    } else if (isPdf) {
      return (
        <Pdf
          source={{ uri, cache: true }}
          style={styles.media}
          horizontal={true}
          enablePaging={true}
          trustAllCerts={false}
          onError={(error) => console.log('PDF load error:', error)}
        />
      );
    } else {
      return <Image source={{ uri }} style={styles.media as ImageStyle} />;
    }
  };

  const renderPost = ({ item }: any) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: item.avatarUri }} style={styles.avatar as ImageStyle} />
          <Text style={styles.username}>{item.username}</Text>
        </View>
        <TouchableOpacity>
          <Icon name="ellipsis-v" size={20} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {renderContent(item)}
      <View style={styles.actions}>
        <View style={styles.leftIcons}>
          <TouchableOpacity onPress={() => {
            dispatch(toggleLike(item.id));
            updatePostInWatermelon(item.id, {
              liked: !item.liked,
              likes: item.liked ? item.likes - 1 : item.likes + 1,
            });
          }}>
            <View style={styles.iconRow}>
              <Icon name={item.liked ? 'heart' : 'heart-o'} size={22} color={item.liked ? 'red' : 'black'} />
              <Text style={styles.countText}> {item.likes}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            dispatch(toggleComment(item.id));
            updatePostInWatermelon(item.id, { comments: (item.comments || 0) + 1 });
          }}>
            <View style={styles.iconRow}>
              <Icon name="comment-o" size={22} />
              <Text style={styles.countText}> {item.comments}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            dispatch(toggleShare(item.id));
            updatePostInWatermelon(item.id, { shares: (item.shares || 0) + 1 });
          }}>
            <View style={styles.iconRow}>
              <Icon name="share" size={22} />
              <Text style={styles.countText}> {item.shares}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => {
          dispatch(toggleSave(item.id));
          updatePostInWatermelon(item.id, { saved: !item.saved });
        }}>
          <Icon name={item.saved ? 'bookmark' : 'bookmark-o'} size={22} />
        </TouchableOpacity>
      </View>

      <Text style={styles.caption}>{item.username} : {item.caption}</Text>
    </View>
  );

  const renderStory = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => {
        dispatch(openStoryModal(item));
        setStoryIndex(posts.findIndex((p) => p.id === item.id));
      }}
      style={styles.storyItem}
    >
      <Image source={{ uri: item.avatarUri }} style={styles.storyAvatar as ImageStyle} />
      <Text style={styles.storyUsername}>{item.username}</Text>
    </TouchableOpacity>
  );

  const handleTap = (event:any) => {
    const x = event.nativeEvent.locationX;
    if (x < screenWidth / 2 && storyIndex > 0) {
      const newIndex = storyIndex - 1;
      setStoryIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex });
    } else if (x > screenWidth / 2 && storyIndex < posts.length - 1) {
      const newIndex = storyIndex + 1;
      setStoryIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex });
    } else {
      dispatch(closeStoryModal());
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        ListHeaderComponent={
          <FlatList
            data={posts}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderStory}
            keyExtractor={(item) => item.id + '-story'}
            contentContainerStyle={styles.storyList}
          />
        }
      />

      <Modal visible={isStoryModalVisible} animationType="fade" transparent>
        <TouchableWithoutFeedback onPressIn={pauseProgress} onPressOut={resumeProgress}>
          <Pressable style={styles.modalContainer} onPress={handleTap}>
            <FlatList
              ref={flatListRef}
              data={posts}
              horizontal
              pagingEnabled
              initialScrollIndex={storyIndex}
              getItemLayout={(_, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              onViewableItemsChanged={onStoryItemsChanged}
              viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
              renderItem={({ item }) => (
                <View style={styles.storyContent}>
                  <View style={styles.progressBarContainer}>
                    <Animated.View
                      style={[styles.progressBar, {
                        width: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      }]}
                    />
                  </View>
                  <Image source={{ uri: item.avatarUri }} style={styles.storyAvatars as ImageStyle} />
                  <Text style={styles.storyUsernames}>{item.username}</Text>
                  {renderContent(item, true)}
                  <Icon2 name="message1" size={24} style={styles.icon2} />
                </View>
              )}
            />
            <TouchableOpacity
              onPress={() => dispatch(closeStoryModal())}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </Pressable>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  postContainer: { marginBottom: 20 },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 8,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  icon: {
    paddingHorizontal: 4,
    color: '#555',
  },
  media: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 16,
    marginLeft: 4,
  },
  caption: {
    paddingHorizontal: 10,
    fontSize: 14,
    marginTop: 4,
  },
  storyList: {
    paddingVertical: 10,
    paddingLeft: 10,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    marginTop: -10,
    borderColor: '#ff8501',
  },
  storyUsername: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyContent: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 28,
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  storyUsernames: {
    position: 'absolute',
    top: 30,
    left: 60,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storyAvatars: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  icon2: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    color: '#fff',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    width: '100%',
    backgroundColor: '#555',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
});

export default Body;