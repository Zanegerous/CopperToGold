import { Modal, Pressable, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";


export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Example button press functions
  // arrow function is preffered for our usecase so I recommend yall use this one
  const buttonPress = () => {
    alert("Button Pressed, ill open the modal")
    setIsModalOpen(true)
  }

  // not recommended but still works, might have some issues though
  function buttonPress2() {
    alert("Button Pressed Here")
  }

  return (
    // Highly recommend using safeareaview as it ensures the border of the screen isnt covered by the camera and stuff 
    <SafeAreaView className={styles.container}>
      <StatusBar barStyle={'light-content'} className='bg-zinc-900' />
      <Text className="text-center text-3xl text-white">Welcome to the home page</Text>

      {/* Button Example */}
      <TouchableOpacity onPress={buttonPress} className="bg-black rounded-b-lg rounded-t-2xl w-1/3 h-8 justify-center">
        <Text className="text-emerald-500 text-center text-2xl">Button Example</Text>
      </TouchableOpacity>

      <Modal visible={isModalOpen}>
        <SafeAreaView className="bg-orange-600 flex-1">

          <Text className="text-6xl p-2 font-light text-center bg-red-700 absolute top-5"> Ok I opened</Text>

          <TouchableOpacity onPress={() => setIsModalOpen(false)} className="w-48 bg-slate-100 p-2 rounded-xl self-center absolute bottom-4 ">
            <Text className="text-center">Close Modal</Text>
          </TouchableOpacity>

        </SafeAreaView>

      </Modal>
    </SafeAreaView>
  );
}


// Showcase of how you can use a style setup, ideally we will create a seperate folder for styles and pull from there for consistent things.
// Will not work using intellisense so recommended to figure out what you want in the actual cell and then move it to styles
// Implementing light/dark mode and stuff should come later
const styles = {
  container: "flex-1 items-center justify-center bg-slate-900",
  text: 'text-center text-3xl text-red-400'
}

