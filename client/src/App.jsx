import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Feed from "./pages/Feed";
import PostDetail from "./pages/PostDetail";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route
                    path="/posts/new"
                    element={
                        <ProtectedRoute>
                            <NewPost />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/posts/:id/edit"
                    element={
                        <ProtectedRoute>
                            <EditPost />
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </>
    );
}
