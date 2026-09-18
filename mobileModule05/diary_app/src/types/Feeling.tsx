import { JSX } from "react";
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export enum Feeling{
    Happy,
    Good,
    Neutral,
    Bad,
    Sad,
    Sick,
    Angry
}

interface IconProps {
  size: number;
  color: string;
}

export const feelingRecord: Record<Feeling, { 
  icon: (props: IconProps) => JSX.Element;
  color: string,
  label: string
}> = {
  [Feeling.Happy]: {
    icon: (props) => <Fontisto name="smiley" size={props.size} color={props.color} />,
    color: '#39ca00',
    label: 'Happy'
  },
  [Feeling.Good]: {
    icon: (props) => <FontAwesome6 name="face-smile" size={props.size} color={props.color} />,
    color: '#e2d411',
    label: 'Good'
  },
  [Feeling.Neutral]: {
    icon: (props) => <Fontisto name="neutral" size={props.size} color={props.color} />,
    color: '#6f8176',
    label: 'Neutral'
  },
  [Feeling.Bad]: {
    icon: (props) => <Entypo name="emoji-sad" size={props.size} color={props.color}/>,
    color: '#1362d2',
    label: 'Bad'
  },
  [Feeling.Sad]: {
    icon: (props) => <FontAwesome6 name="face-sad-cry" size={props.size} color={props.color} />,
    color: '#40d6f0',
    label: 'Sad'
  },
  [Feeling.Sick]: {
    icon: (props) => <MaterialCommunityIcons name="emoticon-sick-outline" size={props.size} color={props.color} />,
    color: '#8737dd',
    label: 'Sick'
  },
  [Feeling.Angry]: {
    icon: (props) => <FontAwesome6 name="angry" size={props.size} color={props.color} />,
    color: '#d52727',
    label: 'Angry'
  }
};