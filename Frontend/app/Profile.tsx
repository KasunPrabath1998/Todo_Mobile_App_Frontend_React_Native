import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { launchImageLibrary } from 'react-native-image-picker';

interface UserDetails {
  fullName: string;
  email: string;
  mobileNumber: string;
  address: string;
  password: string;
  profileImage?: string;
}

const ProfileScreen = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUserDetails, setNewUserDetails] = useState<UserDetails>({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    password: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        if (token && userId) {
          const response = await axios.get(`http://10.0.2.2:3001/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            setUserDetails(response.data);
            setNewUserDetails(response.data); // Initialize with fetched user details
            setSelectedImage(response.data.profileImage || null); // Set initial image
          } else {
            console.error('Error fetching user details:', response.statusText);
          }
        } else {
          console.error('No token or userId found');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('userId');
              router.push('./LoginScreen');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleChange = (name: string, value: string) => {
    setNewUserDetails((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (token && userId) {
        await axios.put(
          `http://10.0.2.2:3001/api/users/profile/${userId}`,
          {
            ...newUserDetails,
            profileImage: selectedImage, // Include the image URL
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert('User details updated successfully');
        setIsEditing(false); // Exit editing mode
      } else {
        console.error('No token or userId found');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });

      if (result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        if (selectedAsset.uri) {
          setSelectedImage(selectedAsset.uri);

          // Convert the image URI to a Blob
          const response = await fetch(selectedAsset.uri);

          if (!response.ok) {
            console.error('Error fetching image:', response.statusText);
            return;
          }

          const blob = await response.blob();

          // Create FormData
          const formData = new FormData();
          formData.append('file', blob, selectedAsset.fileName || 'profile-image.jpg'); // Use the Blob and filename

          // Upload image
          const token = await AsyncStorage.getItem('token');
          const userId = await AsyncStorage.getItem('userId');

          if (token && userId) {
            const uploadResponse = await axios.post(
              `hhttp://10.0.2.2:3001/api/upload-profile-image/${userId}`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data',
                },
              }
            );

            if (uploadResponse.status === 200) {
              setSelectedImage(uploadResponse.data.imageUrl); // Update with the uploaded image URL
            } else {
              console.error('Error uploading image:', uploadResponse.statusText);
            }
          } else {
            console.error('No token or userId found');
          }
        }
      }
    } catch (error) {
      console.error('Error handling image picker:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Profile Picture and Name */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleImagePicker}>
            <Image
              source={{
                uri:
                  selectedImage ||
                  userDetails?.profileImage ||
                  'https://via.placeholder.com/100',
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Text style={styles.profileName}>{userDetails?.fullName || 'Loading...'}</Text>
          <Text style={styles.profileEmail}>{userDetails?.email || 'Loading...'}</Text>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Name:</Text>
            <TextInput
              style={styles.detailValue}
              value={newUserDetails.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              editable={isEditing}
            />
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <TextInput
              style={styles.detailValue}
              value={newUserDetails.mobileNumber}
              onChangeText={(text) => handleChange('mobileNumber', text)}
              editable={isEditing}
            />
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email:</Text>
            <TextInput
              style={styles.detailValue}
              value={newUserDetails.email}
              onChangeText={(text) => handleChange('email', text)}
              editable={isEditing}
            />
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Password:</Text>
            <TextInput
              style={styles.detailValue}
              value={newUserDetails.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
              editable={isEditing}
            />
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleUpdate();
            } else {
              setIsEditing((prev) => !prev);
            }
          }}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Text>
          <Icon name={isEditing ? 'save' : 'edit'} size={20} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    marginHorizontal: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  profileEmail: {
    fontSize: 16,
    color: 'black',
    marginTop: 4,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'black',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: 'black',
    flex: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },
  editButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4511e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 20,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
});

export default ProfileScreen;
