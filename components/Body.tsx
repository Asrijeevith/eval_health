import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLike, toggleSave, toggleComment, toggleShare } from '../features/PostsSlice';
import { RootState } from '../features/Store';
import { PostType } from '../types/PostType';
import Pdf from 'react-native-pdf';
import Video from 'react-native-video';

const Body = () => {
  const posts = useSelector((state: RootState) => state.posts.posts) as PostType[];
  const dispatch = useDispatch();
  const [visiblePostId, setVisiblePostId] = useState<string | null>(null);
  const [imageHeights, setImageHeights] = useState<{ [key: string]: number }>({});

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 70 };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const firstVisible = viewableItems[0];
    if (firstVisible) setVisiblePostId(firstVisible.item.id);
  }).current;

  useEffect(() => {
    posts.forEach((item) => {
      if (item.contentType === 'image' && !imageHeights[item.id]) {
        Image.getSize(
          item.contentUri,
          (width, height) => {
            const screenWidth = Dimensions.get('window').width;
            const ratio = height / width;
            const adjustedHeight = screenWidth * ratio;
            setImageHeights((prev) => ({ ...prev, [item.id]: adjustedHeight }));
          },
          (error) => console.log('Image size error:', error)
        );
      }
    });
  }, [posts]);

  const renderPost = ({ item }: { item: PostType }) => (
    <View style={styles.postWrapper}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatarUri }} style={styles.avatar} />
        <Text style={styles.username}>{item.username}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-v" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {item.contentType === 'image' && (
        <Image
          source={{ uri: item.contentUri }}
          style={[styles.postImage, { height: imageHeights[item.id] || 300 }]}
          resizeMode="contain"
        />
      )}

      {item.contentType === 'video' && (
        <Video
          source={{ uri: item.contentUri }}
          style={styles.video}
          controls
          resizeMode="contain"
          paused={visiblePostId !== item.id}
          muted={false}
          repeat
        />
      )}

{item.contentType === 'pdf' && (
  <View style={{ height: 600, width: '100%' }}>
    <ScrollView nestedScrollEnabled={true}>
      <View style={{ height: 1000 }}>
        <Pdf
          source={{ uri: item.contentUri }}
          style={{ height: 1000, width: '100%' }}
          trustAllCerts={false}
          horizontal={false}
          enablePaging={false}
          enableAnnotationRendering={true}
          onLoadComplete={(numberOfPages) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onError={(error) => {
            console.log('PDF error:', error);
          }}
        />
      </View>
    </ScrollView>
  </View>
)}




      {/* Footer */}
      <View style={styles.postFooter}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={() => dispatch(toggleLike(item.id))} style={styles.iconButton}>
            <Icon name={item.liked ? 'heart' : 'heart-o'} size={24} color={item.liked ? 'red' : '#000'} />
            <Text style={styles.iconText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => dispatch(toggleComment(item.id))} style={styles.iconButton}>
            <Icon name="comment-o" size={24} color="#000" />
            <Text style={styles.iconText}>{item.comments || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => dispatch(toggleShare(item.id))} style={styles.iconButton}>
            <Icon name="share" size={24} color="#000" />
            <Text style={styles.iconText}>{item.shares || 0}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => dispatch(toggleSave(item.id))} style={styles.iconButton2}>
          <Icon name={item.saved ? 'bookmark' : 'bookmark-o'} size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.postContent}>
        <Text style={styles.postText}>
          <Text style={{ fontWeight: 'bold' }}>{item.username}</Text>: {item.caption}
        </Text>
      </View>
    </View>
  );

  const renderStories = () => (
    <View style={styles.storyContainer}>
      <FlatList
        data={posts.map((p) => ({ key: p.username, avatarUri: p.avatarUri }))}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.storyItem}>
            <Image source={{ uri: item.avatarUri }} style={styles.storyAvatar} />
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
    marginBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 21,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  moreButton: {
    paddingHorizontal: 8,
  },
  postImage: {
    width: '100%',
    marginTop: 4,
    backgroundColor: '#f0f0f0',
  },
  video: {
    width: '100%',
    height: 400,
    backgroundColor: 'black',
  },
 pdfContainer: {
  height: 600, // Allows vertical scroll inside PDF
  width: '100%',
  backgroundColor: '#f2f2f2',
},
pdf: {
  flex: 1,
  width: '100%',
},


  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton2: {
    paddingLeft: 10,
  },
  iconText: {
    marginLeft: 4,
    fontSize: 14,
  },
  postContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  postText: {
    fontSize: 14,
    color: '#333',
  },
  storyContainer: {
    paddingVertical: 10,
    paddingLeft: 10,
    backgroundColor: '#ffffffff',
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 14,
  },


   storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 33,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#c13584', // Instagram-style ring
  },

});
