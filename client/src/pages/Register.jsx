import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await register(username, email, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Container style={{ maxWidth: 400 }}>
            <Card className="p-4 shadow-sm">
                <h4 className="mb-3">Sign up</h4>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <Form.Text muted>3-20 characters: letters, numbers, underscores.</Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                        <Form.Text muted>At least 8 characters.</Form.Text>
                    </Form.Group>
                    <Button type="submit" className="w-100" disabled={submitting}>
                        Create account
                    </Button>
                </Form>
                <p className="text-center small mt-3 mb-0">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </Card>
        </Container>
    );
}
