import React, { useContext, createContext, useEffect } from "react";
import ReactDOM from "react-dom";

const defaultState = {
  counter: 1,
  stepSize: 1
};

const mainContext = createContext(defaultState);

const createStore = (reducer, initialState) => {
  let currentState = initialState;
  let listeners = [];

  const getState = () => currentState;
  const dispatch = (action) => {
    currentState = reducer(currentState, action);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener) => listeners.push(listener);

  return { getState, dispatch, subscribe };
};

const useSelector = (selector) => {
  let ctx = useContext(mainContext);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  useEffect(() => ctx.store.subscribe(forceUpdate));

  return selector(ctx.store.getState());
};

const useDispatch = () => {
  const ctx = useContext(mainContext);

  return ctx.store.dispatch;
};

const Provider = ({ store, context, children }) => {
  const Context = context || mainContext;

  return <Context.Provider value={{ store }}>{children}</Context.Provider>;
};

// APP

// actions
const UPDATE_COUNTER = "UPDATE_COUNTER";
const CHANGE_STEP_SIZE = "CHANGE_STEP_SIZE";

// action creastors
const updateCounter = (value) => ({
  type: UPDATE_COUNTER,
  payload: value
});

const changeStepSize = (value) => ({
  type: CHANGE_STEP_SIZE,
  payload: value
});

// reducers
const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_COUNTER:
      return { ...state, counter: state.counter + action.payload };
    case CHANGE_STEP_SIZE:
      return { ...state, stepSize: action.payload };
    default:
      return { ...state };
  }
};

const Counter = () => {
  const { counter, stepSize } = useSelector((state) => state);
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(updateCounter(-Number(stepSize)))}>
        -
      </button>
      <span> {counter} </span>
      <button onClick={() => dispatch(updateCounter(Number(stepSize)))}>
        +
      </button>
    </div>
  );
};

const Step = () => {
  const stepSize = useSelector((state) => state.stepSize);
  const dispatch = useDispatch();

  return (
    <div>
      <div>
        Значение счётчика должно увеличиваться или уменьшаться на заданную
        величину шага
      </div>
      <div>Текущая величина шага: {stepSize}</div>
      <input
        type="range"
        min="1"
        max="5"
        value={stepSize}
        onChange={({ target }) => dispatch(changeStepSize(target.value))}
      />
    </div>
  );
};

ReactDOM.render(
  <Provider store={createStore(reducer, defaultState)}>
    <Step />
    <Counter />
  </Provider>,
  document.getElementById("root")
);
