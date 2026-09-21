import { Link, useNavigate } from "react-router-dom";
import { Navbar as BsNavbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <BsNavbar bg="white" expand="md" className="border-bottom shadow-sm mb-4">
            <Container>
                <BsNavbar.Brand as={Link} to="/" className="fw-bold text-primary">
                    Ripple
                </BsNavbar.Brand>
                <BsNavbar.Toggle aria-controls="main-nav" />
                <BsNavbar.Collapse id="main-nav">
                    <Nav className="ms-auto align-items-md-center gap-2">
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/posts/new">
                                    New post
                                </Nav.Link>
                                <span className="text-muted small">@{user.username}</span>
                                <Button size="sm" variant="outline-secondary" onClick={handleLogout}>
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">
                                    Log in
                                </Nav.Link>
                                <Button as={Link} to="/register" size="sm" variant="primary">
                                    Sign up
                                </Button>
                            </>
                        )}
                    </Nav>
                </BsNavbar.Collapse>
            </Container>
        </BsNavbar>
    );
}
