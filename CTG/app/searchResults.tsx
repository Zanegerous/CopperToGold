import React from "react";
import { Text, Image, View, FlatList } from "react-native";
import "../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import LISTINGS from "@/constants/exampleListings";
import LISTING_PICS from "@/constants/examplePics";

export default function SearchResults() {

  type ItemProps = {
    title: string
    price: number
    cond: string
    imgId : number
  };
  
  const Item = (props: ItemProps) => (
    <View className={styles.listingView}>
      <Image className={styles.image} source={LISTING_PICS[props.imgId]} resizeMode="contain" />
      <Text className={styles.title}>{props.title}</Text>
      <Text className={styles.text}>Price: ${props.price}</Text>
      <Text className={styles.text}>Condition: {props.cond}</Text>
    </View>
  );

  const seperator = <View className={styles.seperator} />

  return (
    <SafeAreaView>
      {/* Insert the search bar stuff here */}
      <FlatList
        // important stuff here
        data={LISTINGS}
        keyExtractor={item => item.id}
        renderItem={({item}) => <Item title={item.title} price={item.price} cond={item.cond} imgId={item.imgId}/>}
        // styling stuff here
        showsVerticalScrollIndicator = {false}
        contentContainerClassName= {styles.container}
        ItemSeparatorComponent={seperator}
      />
    </SafeAreaView>
  )
}

const styles = {
  container: 'bg-slate-700',
  listingView: 'my-6 mx-3',
  image: 'size-[300px] flex-auto mx-auto rounded-sm',
  title: 'text-left text-3xl text-white font-bold',
  text: 'text-left text-2xl text-white',
  seperator : 'bg-slate-800 h-1'
}