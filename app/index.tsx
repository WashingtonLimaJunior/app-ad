import React from 'react';
import { View, Text, Button, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  AudioDescription: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <ImageBackground source={require('../assets/AD.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.header}>Revele o que está em sua frente usando a câmera do telefone</Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Go to Audio Description"
            onPress={() => navigation.navigate('AudioDescription')}
            color="#347344" // Define a cor verde do botão
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    // opacity: 0.7, // Define a opacidade da imagem (valor entre 0 e 1)
  },
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 18,
    backgroundColor: '#ADC7B4',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    marginTop: '50%',
    fontSize: 25 ,
    width: '80%',
    borderRadius: 25,
    justifyContent: 'center', // Alinha o botão verticalmente
    overflow: 'hidden',
    
  },
});

export default HomeScreen;
