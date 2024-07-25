import { createContext, useReducer } from "react";
import "./App.css";
import { initialState, reducer } from "./reducers/user";
import { Toaster } from "react-hot-toast";
import {
  BrowserRouter,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Home from "./pages/home";
import PeerCall from "./pages/peerCall";

export const UserContext = createContext();

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <div>
        <Toaster position="center" />
      </div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/editor/:roomId" element={<PeerCall />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
