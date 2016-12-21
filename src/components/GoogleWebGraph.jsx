/**
Container for the google web graph animation
**/
import 'velocity-animate';
import 'velocity-animate/velocity.ui';
import { VelocityTransitionGroup, VelocityComponent, velocityHelpers } from 'velocity-react';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Line from './Line';
import logo from '../static/img/logo.svg';
import '../static/css/GoogleWebGraph.css';
import { getAnimationState, setAnimationState, removeAnimationState, forceAnimationState}  from './GlobalAppState';
import Animations from './Animations';
import AnimatedDot from './AnimatedDot';

const dotsCount = 30;
const lines = [];
const initialState = {
  animation:  null,
  renderLayout:null,
  animateDots: false,
  currentAppState: 1,
  flashAnim: null,
  dotCss: 'dot',
  renderLines: false,
  linesEnterLogo: null,
  SearchResEnter: null,
};
//Define the main App component
export default class GoogleWebGraph extends Component {
//define the constuctor of the isntance
  constructor(props) {
    super(props);
    //define states
    this.state = initialState;
    //define instance vars
    this.animatedDots = [];
    this.lines = [];

    //bind methods
    this._handleKeyDownandSetState = this._handleKeyDownandSetState.bind(this);
    this._exapandTheGraph = this._exapandTheGraph.bind(this);
    this._removeFlash = this._removeFlash.bind(this);
    this._makeDotsFloat = this._makeDotsFloat.bind(this);
    this._drawLines = this._drawLines.bind(this);
    this._popSearchResults =   this._popSearchResults.bind(this);
    // this._getAllDotsAsync = this._getAllDotsAsync.bind(this);
    // this._genaDot = this._genaDot.bind(this);
  }

/*
Add listeners for the window keyEvents.
*/
  componentWillMount() {
    window.addEventListener('keydown', this._handleKeyDownandSetState, false);

      //mplementing promise based async code - but it does not help, as javascript is not multithreaded - it just simply puts it further on the event loop and does not block next exuction.
    // this._getAllDotsAsync();
    // // .then( (response) => {
    // //   if (response === 'done') {console.log('promise has been fullbilde');}
    // //       // const _this = this;
    // //       // _this._exapandTheGraph();
    // //       // setTimeout(() => {     _this._removeFlash();    }, 140);
    // //   },
    // // );
  }

  //define something just after the component has rendered.
  componentDidMount() {
    this._exapandTheGraph();
    setTimeout(() => {     this._removeFlash();    }, 140);
    setTimeout(() => {     this._drawLines();    }, 12000);

  }

//listener have to be removed after the View component has unmounted, otherwise the state of unmounted component will be still triggered, which can break the app and throw errors.
  componentWillUnmount() {
    window.removeEventListener('keydown', this._handleKeyDownandSetState, false);
  }

//CUstom functions
/***************************************************************************************
//Custom function for handling keyEvents and updating state and animation based on it.
****************************************************************************************/
//function for handling keyevents and state of the presentation - a state machine
    _handleKeyDownandSetState (event){
        // if animation still in progress. or wrong key is pressed
        if (getAnimationState() === false || (event.keyCode !== 37 && event.keyCode !== 39)) return;
          //set the max state here
          const maxAppSate = 2;
          //save last state
          const currentState = this.state.currentAppState;
          let nextState;

          //set the new state
          //37 is if back arrow is pressed. 39 if foward key. Add or remove state corespondingly
          if      (event.keyCode === 37) {
              nextState = (currentState <= 0) ? 0 : currentState - 1;
          } else if (event.keyCode === 39) {
              nextState = (currentState >= maxAppSate) ? maxAppSate : currentState + 1;
          }

            console.log(`next AppState is: ${nextState}, current Appstate is: ${currentState}`);

            //based on state perform animation or animation reversal, as well as reverse animation
            switch(nextState) {

                 case 0: //state for simply jumping to the previous view
                     // if we come back from a bigger state
                     if (currentState > nextState) {
                       //move to the previous view
                       this.props.moveGlobalState('previous');
                       //if we come from a smaller state, it is a bug, log an error.
                     } else if (nextState > currentState) {
                        console.error(`Cannot come from a smaller state to the 0 state. next AppState is: ${nextState}, current Appstate is : ${currentState}`);
                     }
                     break;

                  case 1: // "Server spawned"
                         // if we come back from a bigger state, reverse that bigger state animation
                         if (currentState > nextState) {
                          // this._spwanServer_reverse();
                           //if we come from a smaller state, apply the animation of this state
                         } else if (nextState > currentState) {
                           // this._spwanServer_reverse();
                         }
                       break;

                case maxAppSate: //trigger last animation and fire next state
                        // if we come back from a bigger state, reverse that bigger state animation
                        if (currentState > nextState) {
                          console.error(`Cannot come from a bigger state to the maxAppState. next AppState is: ${nextState}, current Appstate is : ${currentState}`);
                        } else if (nextState > currentState) {
                          this._popSearchResults();
                          // move to the next view
                          //this.props.moveGlobalState('next');
                        }
                        break;
                 default:
                     console.error(`Unknown currentAppState has been triggered, next AppState is: ${nextState}, current Appstate is :${currentState}`);
       }
        //set the state eventually
         this.setState({ currentAppState: nextState});
  }

  /***************************************************************************************
  //Fcunctions for changing classes
  ****************************************************************************************/

  /***************************************************************************************
  //Fcunctions for triggering animation and reverses
  ****************************************************************************************/
  _exapandTheGraph() {
    //console.log('expandingGrahp');
    this.setState({ renderLayout: true });
  }

  _removeFlash() {
    //console.log('removing flash bg');
    this.setState({ flashAnim: Animations.BackgroundFlash });
  }

  _makeDotsFloat() {
    this.setState({ dotCss: 'dot hover' });
  }

  _drawLines() {
    //get specsStart
    const specs = [];
    for (let i = 0; i < dotsCount; i+=1) {
      specs.push(this.animatedDots[i].getBoundingClientRect());
    }
    //generate lines
      for (let i = 0; i < dotsCount; i+=1) {
      const dotStart = this.animatedDots[i];
      const specsStart = specs[i];
          for (let j = i+1; j < dotsCount; j+=1) {
            const dotFinish = this.animatedDots[j];
            const specsFinish = specs[j];
            // console.log(`interation is i[${i}],j[${j}]`);
            // console.log('specsFinish is');
            // console.log(specsFinish);
            // console.log('specsStart is');
            // console.log(specsStart);
            lines.push(<Line animation={this.state.linesEnterLogo} key={(dotsCount*(i+1))+(j+1)} from={{x:specsStart.right-(specsStart.width/2),y:specsStart.bottom-(specsStart.width/2)}} to={{x:specsFinish.right-(specsStart.width/2),y:specsFinish.bottom-(specsStart.width/2)}}/>);

          }
      }

      this.setState({ linesRen: lines });
      //setTimeout(() => {this.setState({linesEnterLogo: Animations.LinesEnterLogo});}, 100);

  }

  _popSearchResults() {
        this.setState({ SearchResEnter: Animations.SearchResEnter});
  }


  /***************************************************************************************
  //Fcunctions for tgenerating dots
  ****************************************************************************************/
  // async _getAllDotsAsync() {
  //   for (let i = 0; i < dotsCount; i+=1) {
  //      const dot = await (<AnimatedDot animateDots={this.state.renderLayout} id={i} key={i}/>);
  //      dotsHtml.push(dot);
  //
  //   }
  // }
  //
  // async _genaDot (i) {
  //   const dot = await (<AnimatedDot animateDots={this.state.renderLayout} id={i} key={i}/>);
  //   return dot;
  // }

 //Render everying
  render() {
    //Animations
    const containerAnim = this.state.renderLayout ? Animations.DotscontainerAnimation : null;
    //const containerAnim = null;
    //and generate dots
    const _this = this;
    const dotsHtml = [];
                      // {renderLines ? {this.lines: null }
    for (let i = 0; i < dotsCount; i+=1) {
      dotsHtml.push(<AnimatedDot animateDots={this.state.renderLayout} dotCss={this.state.dotCss} that={_this} id={i} key={i}/>);
    }
    return (
              <VelocityComponent animation={containerAnim} begin={(elem) => {setAnimationState(elem);}}  complete={(elem) => {removeAnimationState(elem);}}>
                <div className="dot_container">
                  <VelocityComponent animation={this.state.flashAnim} begin={(elem) => {setAnimationState(elem);}}  complete={(elem) => {removeAnimationState(elem);}}>
                  <div  className="flash_container flash"/>
                  </VelocityComponent>
                  <ReactCSSTransitionGroup
                    transitionName="line-flash"
                    transitionAppear
                    transitionAppearTimeout={500}
                    transitionEnter
                    transitionEnterTimeout={500}
                    transitionLeave
                    transitionLeaveTimeout={500}>
                      {this.state.linesRen}
                   </ReactCSSTransitionGroup>
                   {dotsHtml}
                   <VelocityComponent animation={this.state.SearchResEnter} begin={(elem) => {setAnimationState(elem);}}  complete={(elem) => {removeAnimationState(elem);}} >
                     <div className="searcRes">
                       <div>
                         <p>{this.props.searchTerm}</p>
                       </div>
                       <ul>
                         <li>{'item 1'}</li>
                         <li>{'item 2'}</li>
                      </ul>
                    </div>
                   </VelocityComponent>
                 </div>
              </VelocityComponent>
    );
  }
}
//define propTypes
GoogleWebGraph.propTypes = {
  moveGlobalState: React.PropTypes.func,
  searchTerm: React.PropTypes.string,
};

GoogleWebGraph.defaultProps = {
  moveGlobalState: null,
  searchTerm: 'Search Term',
};
