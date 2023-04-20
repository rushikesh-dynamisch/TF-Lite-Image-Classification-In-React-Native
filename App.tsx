import React, {Fragment, Component} from 'react';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Tflite from 'tflite-react-native';   //Using this Library we can apply image classification model.
let tflite = new Tflite();

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileUri: '',
      result:"Prediction",
      confidence:"Confidence",
      index:'1'
    };
    this.loadModel();
  }
loadModel=()=>{                  //Load model methods loads the tf model inside android/app/main/assets
  tflite.loadModel({
    model: 'mobilenet_v1_1.0_224.tflite',// required  
    labels: 'mobilenet_v1_1.0_224.txt',  // required
    numThreads: 1,                              // defaults to 1  
  },
  (err, res) => {
    if(err)
    {
      console.log(err);
    }
    else
     {
       console.log(res);
    }
  });

}
performImageClassification=()=>{             //This method used to apply tf model on selected image form gallary or camera
  tflite.runModelOnImage({
    path: this.state.fileUri,  // required
    imageMean: 128.0, // defaults to 127.5
    imageStd: 128.0,  // defaults to 127.5
    numResults: 3,    // defaults to 5
    threshold: 0.05   // defaults to 0.1
  },
  (err, res) => {
    if(err)
      console.log(err);
    else
    {this.state.result ="";
      res.map(e=>
        {
         this.state.result += e['label']+"  "+(e["confidence"]*100).toFixed(0)+"%\n";
        })
      this.setState({result:this.state.result})
    }
      // console.log(res);
  });

}


  chooseImage = () => {                //ChooseImage from gallary
    let options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    launchImageLibrary(options, response => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else {
        console.log('response', JSON.stringify(response));
        this.setState({
          fileUri: response.assets[0].uri,
        });
        this.performImageClassification();
      }
    });
  };

  launchCamera = () => {                   //click image from camera.
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    launchCamera(options, response => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else {
        console.log('response', JSON.stringify(response));
        this.setState({
          fileUri: response.assets[0].uri,
        });
        this.performImageClassification();
      }
    });
  };

  renderFileUri() {
    if (this.state.fileUri) {
      return <Image source={{uri: this.state.fileUri}} style={styles.images} />;
    } else {
      return (
        <Image
          source={{
            uri: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
          }}
          style={styles.images}
        />
      );
    }
  }
  render() {
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <View style={styles.body}>
            <Text
              style={{textAlign: 'center', fontSize: 20, paddingBottom: 10}}>
              Pick Images from Camera & Gallery
            </Text>
            <View style={styles.ImageSections}>
              <View>{this.renderFileUri()}</View>
            </View>
            <Text style={{textAlign:'center'}}>{this.state.result}</Text>
            {/* <Text style={{textAlign:'center'}}>{this.state.confidence}</Text>
            <Text style={{textAlign:'center'}}>{this.state.index}</Text> */}   
            <View style={styles.btnParentSection}>
              <TouchableOpacity
                onPress={this.chooseImage}
                style={styles.btnSection}>
                <Text style={styles.btnText}>Choose File</Text>
              </TouchableOpacity>
             
              <TouchableOpacity
                onPress={this.launchCamera}
                style={styles.btnSection}>
                <Text style={styles.btnText}>Directly Launch Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },

  body: {
    backgroundColor: 'white',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    height: Dimensions.get('screen').height - 20,
    width: Dimensions.get('screen').width,
  },
  ImageSections: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  images: {
    width: 250,
    height: 250,
    borderColor: 'black',
    borderWidth: 1,
    marginHorizontal: 3,
  },
  btnParentSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  btnSection: {
    width: 225,
    height: 50,
    backgroundColor: '#DCDCDC',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    marginBottom: 10,
  },
  btnText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

