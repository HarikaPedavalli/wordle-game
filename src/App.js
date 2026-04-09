import React, { useState, useEffect, useCallback } from 'react';


const API_URL = 'https://wgg522pwivhvi5gqsn675gth3q0otdja.lambda-url.us-east-1.on.aws/626f6e';

function App() {
  const [secretWord, setSecretWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing');

  const MAX_GUESSES = 5;
  const WORD_LENGTH = 5;

  useEffect(() => {
    const fetchWord = async () => {
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const data = await response.json();
          const word = data.word || data.value || data;
          setSecretWord(word.toUpperCase());
        } else {
          throw new Error('Failed to fetch word');
        }
      } catch (err) {
        console.error('Error fetching word:', err);
        setSecretWord('BONFI');
      } finally {
        setLoading(false);
      }
    };

    fetchWord();
  }, []);

  const handleKeyup = useCallback((e) => {
    if (gameStatus !== 'playing') return;
    const { key } = e;

    if (key === 'Enter') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(key)) {
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(prev => (prev + key).toUpperCase());
      }
    }
  }, [currentGuess, gameStatus]);

  useEffect(() => {
    window.addEventListener('keyup', handleKeyup);
    return () => window.removeEventListener('keyup', handleKeyup);
  }, [handleKeyup]);

  const submitGuess = () => {
    const guess = currentGuess.toUpperCase();
    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (guess === secretWord) {
      setGameStatus('won');
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
    }
  };

  const getCellColor = (guess, index) => {
    const char = guess[index];
    if (!secretWord) return null;
    if (secretWord[index] === char) return 'green';
    else if (secretWord.includes(char)) return 'yellow';
    else return 'red';
  };

  const renderCell = (char, color, key) => {
    const style = {
      width: '50px',
      height: '50px',
      border: '2px solid #ccc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      backgroundColor: color === 'green' ? '#6aaa64' : 
                     color === 'yellow' ? '#c9b458' : 
                     color === 'red' ? '#787c7e' : 'white',
      color: color ? 'white' : 'black',
      margin: '2px'
    };
    return <div key={key} style={style}>{char}</div>;
  };

  const renderRow = (guess, rowIndex) => {
    const cells = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      const char = guess ? guess[i] : '';
      const color = guess ? getCellColor(guess, i) : null;
      cells.push(renderCell(char, color, `${rowIndex}-${i}`));
    }
    return (
      <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center', margin: '2px' }}>
        {cells}
      </div>
    );
  };

  const renderCurrentRow = () => {
    const cells = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      const char = currentGuess[i] || '';
      cells.push(renderCell(char, null, `current-${i}`));
    }
    return (
      <div key="current" style={{ display: 'flex', justifyContent: 'center', margin: '2px' }}>
        {cells}
      </div>
    );
  };

  const renderEmptyRows = () => {
    const rows = [];
    const remainingRows = MAX_GUESSES - guesses.length - (gameStatus === 'playing' ? 1 : 0);
    for (let i = 0; i < remainingRows; i++) {
      rows.push(renderRow(null, `empty-${i}`));
    }
    return rows;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Wordle</h1>
      
      <div style={{ margin: '20px auto', display: 'inline-block' }}>
        {guesses.map((guess, index) => renderRow(guess, index))}
        {gameStatus === 'playing' && renderCurrentRow()}
        {renderEmptyRows()}
      </div>

      {gameStatus === 'playing' && (
        <div style={{ margin: '20px' }}>
          <input
            type="text"
            value={currentGuess}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, WORD_LENGTH);
              setCurrentGuess(val);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentGuess.length === WORD_LENGTH) {
                submitGuess();
              }
            }}
            placeholder="Type your 5-letter guess"
            maxLength={WORD_LENGTH}
            style={{
              padding: '10px',
              fontSize: '18px',
              textTransform: 'uppercase',
              textAlign: 'center',
              width: '200px'
            }}
            autoFocus
          />
          <button
            onClick={() => currentGuess.length === WORD_LENGTH && submitGuess()}
            disabled={currentGuess.length !== WORD_LENGTH}
            style={{
              padding: '10px 20px',
              marginLeft: '10px',
              fontSize: '18px',
              cursor: currentGuess.length === WORD_LENGTH ? 'pointer' : 'not-allowed',
              opacity: currentGuess.length === WORD_LENGTH ? 1 : 0.5
            }}
          >
            Guess
          </button>
        </div>
      )}

      {gameStatus === 'won' && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          backgroundColor: '#d4edda', 
          border: '2px solid #28a745',
          borderRadius: '5px',
          display: 'inline-block'
        }}>
          <h2>You've won! 🎉</h2>
          <p>The word was: <strong>{secretWord}</strong></p>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          backgroundColor: '#f8d7da', 
          border: '2px solid #dc3545',
          borderRadius: '5px',
          display: 'inline-block'
        }}>
          <h2>You've lost! 😢</h2>
          <p>The word was: <strong>{secretWord}</strong></p>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p>Type a 5-letter word and press Enter or click Guess</p>
        <p>
          <span style={{ color: '#6aaa64', fontWeight: 'bold' }}>Green</span> = Correct position | 
          <span style={{ color: '#c9b458', fontWeight: 'bold' }}> Yellow</span> = In word, wrong position | 
          <span style={{ color: '#787c7e', fontWeight: 'bold' }}> Gray</span> = Not in word
        </p>
      </div>
    </div>
  );
}

export default App;