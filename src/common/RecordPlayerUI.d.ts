import React from 'preact';

import Recall from '../../sdk/RecordPlayer.2.0.0';
interface IProps {
    player: Recall;
}
interface IStates {
    time: number;
    duration: number;
    showLabel: boolean;
    labelLeft: number;
    labelText: string;
    paused: boolean;
}
export default class UI extends React.Component<IProps, IStates> {
    constructor(props: IProps);
    updateTime(time: number): void;
    onMouseMove: (e: MouseEvent) => void;
    pauseOrPlay: (e: MouseEvent) => void;
    showPosition: (e: MouseEvent) => void;
    hidePosition: (e: MouseEvent) => void;
    seekTo: (e: MouseEvent) => void;
    render(props: IProps, state: IStates): JSX.Element;
}
export declare function mount(dom: HTMLElement, player: Recall, styles: any): () => void;

