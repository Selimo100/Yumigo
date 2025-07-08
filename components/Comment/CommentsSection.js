// Comments Section - Sektion zur Anzeige aller Kommentare mit Like-Funktionalität
import {StyleSheet, Text, View} from 'react-native';
import {CommentItem} from './CommentComponents';

export const CommentsSection = ({ comments, onCommentLike, theme, commentsRef }) => {
  const styles = StyleSheet.create({
    commentsSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
    },
    commentsList: {
      marginTop: 10,
    },
    noComments: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    noCommentsText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: 12,
    },
    noCommentsSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <View ref={commentsRef} style={styles.commentsSection}>
      <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
      
      <View style={styles.commentsList}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onLike={onCommentLike}
              theme={theme} 
            />
          ))
        ) : (
          <View style={styles.noComments}>
            <Text style={styles.noCommentsText}>No comments yet</Text>
            <Text style={styles.noCommentsSubtext}>Be the first to share your thoughts!</Text>
          </View>
        )}
      </View>
    </View>
  );
};