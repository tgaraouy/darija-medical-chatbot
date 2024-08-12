import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Send, VolumeUp } from '@mui/icons-material';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);
  const [language, setLanguage] = useState('darija');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!welcomeMessageSent) {
      addBotMessage("Merhba! Ana l'assistant dyalk l'Darija Medical Terms. Kifach n9der n3awnek lyum?");
      setWelcomeMessageSent(true);
    }
  }, [welcomeMessageSent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (text, terms = null) => {
    setMessages(prevMessages => [...prevMessages, { text, isBot: true, terms }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    setMessages(prevMessages => [...prevMessages, { text: input, isBot: false }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Sending search request for "${input}" in ${language}`);
      const response = await fetch(`${API_URL}/terms/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input, language }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response:', data);

      if (data.terms && data.terms.length > 0) {
        console.log(`Found ${data.terms.length} terms`);
        addBotMessage("Here's what I found:", data.terms);
      } else {
        console.log('No terms found');
        addBotMessage(data.message || "No terms found. Please try a different query.");
      }
    } catch (error) {
      console.error('Error processing query:', error);
      setError(error.message);
      addBotMessage("Sorry, there was an error processing your request. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const speak = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Text-to-speech not supported in this browser');
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 2 }}>
        Darija Medical Terms Chatbot
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ height: '60vh', overflow: 'auto', p: 2, mb: 2 }}>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index} sx={{ justifyContent: message.isBot ? 'flex-start' : 'flex-end' }}>
              <Paper elevation={3} sx={{ p: 1, maxWidth: '70%', bgcolor: message.isBot ? 'grey.100' : 'primary.light' }}>
                <ListItemText primary={message.text} sx={{ whiteSpace: 'pre-wrap' }} />
                {message.terms && (
                  <List>
                    {message.terms.map((term, termIndex) => (
                      <ListItem key={termIndex}>
                        <Paper elevation={1} sx={{ p: 1, width: '100%' }}>
                          <Typography variant="h6">{term.darija_medical_term}</Typography>
                          <Typography variant="body2">Category: {term.category_french}</Typography>
                          <Typography variant="body2">French: {term.term_french}</Typography>
                          <Typography variant="body2">English: {term.term_english}</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>Description: {term.contextual_description_french}</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>Example Scenario: {term.example_scenario}</Typography>
                          <Button onClick={() => speak(term.darija_medical_term, 'ar-MA')} size="small" startIcon={<VolumeUp />}>
                            Darija
                          </Button>
                          <Button onClick={() => speak(term.term_french, 'fr-FR')} size="small" startIcon={<VolumeUp />}>
                            French
                          </Button>
                          <Button onClick={() => speak(term.term_english, 'en-US')} size="small" startIcon={<VolumeUp />}>
                            English
                          </Button>
                        </Paper>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef}></div>
        </List>
      </Paper>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Language</InputLabel>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          label="Language"
        >
          <MenuItem value="darija">Darija</MenuItem>
          <MenuItem value="french">French</MenuItem>
          <MenuItem value="english">English</MenuItem>
        </Select>
      </FormControl>

      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          sx={{ mr: 1 }}
          disabled={isLoading}
        />
        <Button type="submit" variant="contained" startIcon={<Send />} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </form>
    </Container>
  );
}

export default App;
