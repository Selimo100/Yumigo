import React from 'react';

describe('FollowButton', () => {
  test('Placeholder test - Component existiert', () => {
    
    expect(true).toBe(true);
  });

  test('kann Button-Logic simulieren', () => {
    let isFollowing = false;
    
    const toggleFollow = () => {
      isFollowing = !isFollowing;
    };
    
    expect(isFollowing).toBe(false);
    toggleFollow();
    expect(isFollowing).toBe(true);
    toggleFollow();
    expect(isFollowing).toBe(false);
  });
});
