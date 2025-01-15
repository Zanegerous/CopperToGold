import { Text, Image, View, FlatList } from "react-native";
import "../../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import LISTINGS from "@/constants/exampleListings";
import LISTING_PICS from "@/constants/examplePics";

type ItemProps = {
  title: string
  price: number
  cond: string
  imgId : number
};

const Item = (props: ItemProps) => (
  <View>
    <Image source={LISTING_PICS[props.imgId]} />
    <Text>{props.title}</Text>
    <Text>Price: ${props.price} </Text>
    <Text>Condition: {props.cond}</Text>
  </View>
);

export default function SearchResults() {
  return (
    <SafeAreaView>
      <Text> Welcome to the search results page </Text>
      <FlatList
        data={LISTINGS}
        renderItem={({item}) => <Item title={item.title} price={item.price} cond={item.cond} imgId={item.imgId}/>}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  )
}

const styles = {
  container: "flex-1 items-center justify-center bg-blue-600",
  text: 'text-center text-3xl text-red-400'
}