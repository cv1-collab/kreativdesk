import React from 'react';

export default function Project3DViewer() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#09090b', 
      color: '#22c55e', // Grün
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        ✅ REACT FUNKTIONIERT!
      </h1>
      <p style={{ color: '#a1a1aa' }}>
        Wenn du diesen Text auf dem Handy siehst, war die mobile Wisch-Navigation der Grund für alle Abstürze.
      </p>
    </div>
  );
}