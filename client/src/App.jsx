import './App.css'
import { NavBar } from './Components/NavBar';
import {Routes, Route} from 'react-router-dom'
import Login from './Pages/Login';
import Home from './Pages/Home';
import OAuth2 from './Pages/OAuth2';
import Register from './Pages/Register';
import NewCollection from './Pages/Collections/NewCollection';
import Auth from './Middleware/Auth';
import { Container } from 'react-bootstrap';
import Collection from './Pages/Collections/[id]';
import MyCollections from './Pages/Collections/MyCollections';
import NewItem from './Pages/Collections/Items/NewItem';
import EditItem from './Pages/Collections/Items/EditItem';
import Item from './Pages/Collections/Items/[itemId]';
import Search from './Pages/Search';
import NotFound from './Pages/404';
import Dashboard from './Pages/Admin/Dashboard';
import Admin from './Middleware/Admin';
import UserCollections from './Pages/Admin/User/UserCollections';
import EditCollection from './Pages/Collections/EditCollection';

function App() {
  return (
    <>
      <NavBar />
      <Container>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/oauth2' element={<OAuth2 />} />
          <Route path='/register' element={<Register />} />
          <Route path='/search' element={<Search />} />
          <Route path='/collections/:collectionId' element={<Collection />} />
          <Route path='/collections/my' element={<Auth><MyCollections /></Auth>} />
          <Route path='/collections/new' element={<Auth><NewCollection /></Auth>} />
          <Route path='/collections/:collectionId/edit' element={<Auth><EditCollection /></Auth>} />
          <Route path='/collections/:collectionId/item/:itemId' element={<Item />} />
          <Route path='/collections/:collectionId/new-item' element={<Auth><NewItem /></Auth>} />
          <Route path='/collections/:collectionId/edit-item/:itemId' element={<Auth><EditItem /></Auth>} />
          <Route path='/admin/dashboard' element={<Auth><Admin><Dashboard /></Admin></Auth>} />
          <Route path='/admin/collections/:userId' element={<Auth><Admin><UserCollections /></Admin></Auth>} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
