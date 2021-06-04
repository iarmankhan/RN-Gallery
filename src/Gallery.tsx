import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {API_KEY} from '@env'

interface PexelImage {
    id: string;
    src: {
        portrait: string;
        small: string;
    }
}

const {width, height} = Dimensions.get('screen');
const IMAGE_SIZE = 80;
const SPACING = 8

const API_URL = "https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20"

const fetchImagesFromPexels = async (): Promise<PexelImage[]> => {
    const response = await fetch(API_URL, {
        headers: {
            'Authorization': API_KEY
        }
    })

    const {photos} = await response.json()

    return photos
};

const Gallery: React.FC = () => {

    const [images, setImages] = useState<PexelImage[] | null>(null)

    const [activeIndex, setActiveIndex] = useState(0);

    const topListRef = useRef<FlatList>(null)
    const bottomListRef = useRef<FlatList>(null)

    const setActiveSlide = (index: number) => {
        setActiveIndex(index)
        topListRef.current?.scrollToIndex({
            index,
            animated: true
        })

        bottomListRef.current?.scrollToOffset({
            offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
            animated: true
        })
    }

    useEffect(() => {
        const fetchImages = async () => {
            const images = await fetchImagesFromPexels();
            setImages(images)
        }
        fetchImages().then()
    }, [])

    if (!images) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator color='lightblue' size={20}/>
            </View>
        )
    }

    return <View style={styles.container}>
        <FlatList
            ref={topListRef}
            bounces={false}
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            data={images}
            keyExtractor={item => item.id.toString()}
            onMomentumScrollEnd={event => {
                setActiveSlide(event.nativeEvent.contentOffset.x / width)
            }}
            renderItem={({item}) => <Image source={{uri: item.src.portrait}} style={styles.mainImage}/>}
        />

        <View style={styles.thumbnails}>
            <FlatList
                ref={bottomListRef}
                horizontal
                contentContainerStyle={{paddingHorizontal: SPACING}}
                showsHorizontalScrollIndicator={false}
                data={images}
                keyExtractor={item => item.id.toString()}
                renderItem={({item, index}) => (
                    <TouchableOpacity activeOpacity={0.6} onPress={() => setActiveSlide(index)}>
                        <Image
                            source={{uri: item.src.portrait}}
                            style={[styles.thumbnail, {borderColor: index === activeIndex ? 'white' : '#444'}]}
                        />
                    </TouchableOpacity>
                )}
            />
        </View>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'powderblue'
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainImage: {width, height},
    thumbnails: {
        position: 'absolute',
        bottom: IMAGE_SIZE,
    },
    thumbnail: {
        borderWidth: 2,
        borderRadius: 10,
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        marginHorizontal: SPACING / 2
    }
});

export default Gallery;
