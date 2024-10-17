import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const Main = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button
        title="Go to Search Canteen"
        onPress={() => navigation.navigate('SearchCanteen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default Main;
