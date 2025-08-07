import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { RootState } from '../features/Store';
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

const safeStringify = (obj: any) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }, 2);
};
const FALLBACK_URLS = {
  image: 'https://picsum.photos/200/300',
  video: 'https://www.w3schools.com/html/mov_bbb.mp4',
  pdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
};

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
    posts.findIndex((post) => post.id === currentStory?.id)
  );
  const [visiblePostId, setVisiblePostId] = useState<string | null>(null);
  const [visibleStoryId, setVisibleStoryId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const hasFetched = useRef(false); // Prevent multiple fetches

  const progress = useRef(new Animated.Value(0)).current;
  const [isPaused, setIsPaused] = useState(false);

  const storyDuration = 30000;

  useEffect(() => {
    if (hasFetched.current) {
      console.log('Skipping fetch, already executed');
      return;
    }
    hasFetched.current = true;

    const fetchPosts = async () => {
      try {
        console.log('Fetching posts from WatermelonDB...');
        const postsCollection = database.get<Post>('posts');
        console.log('Posts collection accessed:', postsCollection);
        const fetchedPosts = await postsCollection.query().fetch();
        console.log('Fetched posts count:', fetchedPosts.length, 'Posts:', fetchedPosts.map(p => ({ id: p.id, contentUri: p.contentUri, contentType: p.contentType })));
        
        // Remove duplicates by ID
        const uniquePosts = Array.from(
          new Map(fetchedPosts.map(post => [post.id, post])).values()
        );
        console.log('Unique posts count:', uniquePosts.length);

        // Limit to expected number of posts (3)
        if (uniquePosts.length > 3) {
          console.warn('Unexpected post count, limiting to 3 posts');
          uniquePosts.splice(3);
        }

        const postsData = await Promise.all(
          uniquePosts.map(async (post) => {
            console.log('Fetching user for post:', post.id);
            let user;
            try {
              user = await post.user.fetch();
              console.log('User fetched:', user._raw);
            } catch (error) {
              console.error('Failed to fetch user for post:', post.id, safeStringify(error));
              user = { id: '', username: 'Unknown', avatarUri: 'https://i.pravatar.cc/150?img=0' };
            }
            return {
              id: post.id,
              contentUri: post.contentUri,
              userId: post.userId,
              user: {
                id: user.id,
                username: user.username,
                avatarUri: user.avatarUri,
              },
              likes: post.likes,
              caption: post.caption,
              liked: post.liked,
              saved: post.saved,
              comments: post.comments,
              shares: post.shares,
              contentType: post.contentType as 'image' | 'video' | 'pdf',
            };
          })
        );
        console.log('Posts data prepared:', postsData.map(p => ({ id: p.id, contentUri: p.contentUri, contentType: p.contentType })));
        dispatch(setPosts(postsData)); // Replace, don't append
      } catch (error) {
        console.error('Failed to fetch posts from WatermelonDB:', safeStringify(error));
      }
    };
    // Reset posts before fetching to avoid duplicates
    dispatch(setPosts([]));
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
      } else {
        console.warn('Post not found for update:', postId);
      }
    } catch (error) {
      console.error('Failed to update post in WatermelonDB:', safeStringify(error));
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

  const handleTap = useCallback(
    (event: any) => {
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
    },
    [storyIndex, posts, flatListRef, dispatch]
  );

  const startProgressBar = useCallback(() => {
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
  }, [progress, isPaused, storyDuration, handleTap]);

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
  }, [isStoryModalVisible, storyIndex, startProgressBar, progress]);

  const renderContent = (item: any, isStory = false) => {
    let uri = item.contentUri ? `${item.contentUri}?t=${Date.now()}` : '';
    const isVideo = item.contentType === 'video';
    const isPdf = item.contentType === 'pdf';
    const shouldPlay = isStory
      ? item.id === visibleStoryId
      : item.id === visiblePostId;

    // Check for invalid URLs and use fallback
    if (uri.includes('example.com')) {
      console.warn(`Invalid URI detected for post ${item.id}: ${uri}, using fallback`);
      uri = FALLBACK_URLS[item.contentType] + `?t=${Date.now()}`;
    }

    console.log('Rendering content for post:', item.id, 'URI:', uri, 'Type:', item.contentType);

    if (!uri) {
      return (
        <View style={styles.media}>
          <Text style={styles.errorText}>
            Failed to load content{'\n'}URI: Missing{'\n'}Type: {item.contentType || 'Unknown'}
          </Text>
        </View>
      );
    }

    if (isVideo) {
      return (
        <Video
          source={{ uri }}
          style={styles.media}
          resizeMode="cover"
          controls={isStory ? false : true}
          paused={!shouldPlay}
          repeat
          onError={(error) => console.error('Video load error for post', item.id, 'URI:', uri, 'Error:', safeStringify(error))}
          onLoad={() => console.log('Video loaded for post:', item.id, 'URI:', uri)}
        />
      );
    } else if (isPdf) {
      return (
        <Pdf
          source={{ uri, cache: false }}
          style={styles.media}
          horizontal={true}
          enablePaging={true}
          trustAllCerts={false}
          onError={(error) => console.error('PDF load error for post', item.id, 'URI:', uri, 'Error:', safeStringify(error))}
          onLoadComplete={() => console.log('PDF loaded for post:', item.id, 'URI:', uri)}
        />
      );
    } else {
      return (
        <Image
          source={{ uri }}
          style={styles.media as ImageStyle}
          onError={(error) => console.error('Image load error for post', item.id, 'URI:', uri, 'Error:', safeStringify(error))}
          onLoad={() => console.log('Image loaded for post:', item.id, 'URI:', uri)}
          defaultSource={{ uri: 'https://via.placeholder.com/300x300?text=Image+Failed' }}
        />
      );
    }
  };

  const renderPost = ({ item }: any) => {
    console.log('Rendering post:', item.id, 'Total posts:', posts.length, 'Posts:', posts.map(p => p.id));
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: item.user.avatarUri }} style={styles.avatar as ImageStyle} />
            <Text style={styles.username}>{item.user.username}</Text>
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

        <Text style={styles.caption}>{item.user.username} : {item.caption}</Text>
      </View>
    );
  };

  const renderStory = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => {
        dispatch(openStoryModal(item));
        setStoryIndex(posts.findIndex((p) => p.id === item.id));
      }}
      style={styles.storyItem}
    >
      <Image source={{ uri: item.user.avatarUri }} style={styles.storyAvatar as ImageStyle} />
      <Text style={styles.storyUsername}>{item.user.username}</Text>
    </TouchableOpacity>
  );

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
                  <Image source={{ uri: item.user.avatarUri }} style={styles.storyAvatars as ImageStyle} />
                  <Text style={styles.storyUsernames}>{item.user.username}</Text>
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 14,
    padding: 10,
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