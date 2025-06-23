import { useState } from 'react';

export default function TestHack() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">🚨 Test Hack Challenge</h1>
      
      <div 
        dangerouslySetInnerHTML={{
          __html: `
            <div id="hackContainer">
              <button 
                onclick="loadWords()"
                style="
                  background-color: #10b981; 
                  color: white; 
                  padding: 10px 20px;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  margin: 10px 5px;
                "
              >
                📋 Charger les mots disponibles
              </button>
              
              <button 
                onclick="triggerHack()"
                style="
                  background-color: #ef4444; 
                  color: white; 
                  padding: 15px 30px;
                  border: none;
                  border-radius: 8px;
                  cursor: pointer;
                  font-size: 18px;
                  font-weight: bold;
                  margin: 10px 5px;
                "
              >
                🎲 Déclencher un Hack
              </button>
              
              <div id="wordsContainer" style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; display: none;">
                <h3 style="margin-bottom: 10px;">📋 Mots disponibles en BDD:</h3>
                <div id="wordsList"></div>
              </div>
              
              <div id="challengeContainer" style="display: none; margin-top: 20px; padding: 20px; background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px;">
                <h2 style="color: #dc2626; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 15px;">
                  🚨 VOUS AVEZ ÉTÉ HACKÉ ! 🚨
                </h2>
                
                <div id="challengeInfo" style="margin-bottom: 15px;"></div>
                
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
                  <strong>Code chiffré:</strong><br>
                  <span id="encryptedCode" style="font-family: monospace; font-size: 24px; color: #1f2937;"></span>
                </div>
                
                <div style="background: #dbeafe; padding: 10px; border-radius: 5px; margin: 15px 0;">
                  <strong>💡 Indice:</strong> <span id="explanation"></span>
                </div>
                
                <div style="text-align: center; margin: 15px 0;">
                  ⏱️ Temps restant: <span id="timeLeft" style="font-weight: bold; color: #2563eb;">--</span>s
                </div>
                
                <div id="answerButtons" style="margin: 15px 0;">
                  <h4 style="margin-bottom: 10px;">🎯 Cliquez sur la bonne réponse:</h4>
                  <div id="buttonsList"></div>
                </div>
                
                <div style="margin-top: 15px; padding: 10px; background: #fef3c7; border-radius: 5px;">
                  <strong>💡 Aide:</strong> Le mot original (avant chiffrement) est l'un des mots ci-dessus
                </div>
              </div>
              
              <div id="resultContainer" style="margin-top: 20px; padding: 15px; border-radius: 5px; display: none;"></div>
            </div>

            <script>
              let currentChallenge = null;
              let timer = null;
              let availableWords = [];
              
              async function loadWords() {
                console.log('📋 Chargement des mots...');
                
                try {
                  const response = await fetch('http://localhost:3001/api/hack-challenge/words');
                  const data = await response.json();
                  
                  console.log('📊 Mots reçus:', data);
                  availableWords = data.words;
                  
                  document.getElementById('wordsContainer').style.display = 'block';
                  document.getElementById('wordsList').innerHTML = 
                    availableWords.map(word => 
                      '<span style="display: inline-block; margin: 5px; padding: 8px 12px; background: #e5e7eb; border-radius: 5px; font-weight: bold;">' + 
                      word + '</span>'
                    ).join('');
                    
                } catch (error) {
                  console.error('❌ Erreur chargement mots:', error);
                  alert('Erreur: ' + error.message);
                }
              }
              
              async function triggerHack() {
                console.log('🚨 Déclenchement du hack...');
                
                try {
                  const response = await fetch('http://localhost:3001/api/hack-challenge/trigger', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  
                  if (!response.ok) {
                    throw new Error('Erreur API: ' + response.status);
                  }
                  
                  const challenge = await response.json();
                  console.log('🎯 Défi reçu:', challenge);
                  
                  currentChallenge = challenge;
                  displayChallenge(challenge);
                  startTimer(challenge.time_limit);
                  
                } catch (error) {
                  console.error('❌ Erreur:', error);
                  alert('Erreur: ' + error.message);
                }
              }
              
              function displayChallenge(challenge) {
                document.getElementById('challengeContainer').style.display = 'block';
                document.getElementById('resultContainer').style.display = 'none';
                
                document.getElementById('challengeInfo').innerHTML = 
                  '<strong>Difficulté:</strong> ' + challenge.difficulty + 
                  ' | <strong>Algorithme:</strong> ' + challenge.algorithm;
                
                document.getElementById('encryptedCode').textContent = challenge.encrypted_code;
                document.getElementById('explanation').textContent = challenge.explanation;
                
                // ✅ Créer les boutons pour chaque mot
                if (availableWords.length === 0) {
                  document.getElementById('buttonsList').innerHTML = 
                    '<p style="color: #dc2626;">⚠️ Chargez d\\'abord les mots disponibles</p>';
                } else {
                  document.getElementById('buttonsList').innerHTML = 
                    availableWords.map(word => 
                      '<button onclick="selectAnswer(\\''+word+'\\')" style="' +
                      'margin: 5px; padding: 10px 15px; ' +
                      'background: #3b82f6; color: white; ' +
                      'border: none; border-radius: 5px; cursor: pointer; ' +
                      'font-weight: bold;' +
                      '">' + word + '</button>'
                    ).join('');
                }
              }
              
              async function selectAnswer(selectedWord) {
                console.log('🎯 Mot sélectionné:', selectedWord);
                
                try {
                  const response = await fetch('http://localhost:3001/api/hack-challenge/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      challengeId: currentChallenge.id,
                      answer: selectedWord
                    })
                  });
                  
                  const result = await response.json();
                  console.log('📋 Résultat:', result);
                  
                  if (result.success) {
                    clearInterval(timer);
                    showResult(true, result.message, null, result.time_taken);
                  } else {
                    showResult(false, result.message, result.correct_answer);
                  }
                  
                } catch (error) {
                  console.error('❌ Erreur soumission:', error);
                  alert('Erreur: ' + error.message);
                }
              }
              
              function startTimer(timeLimit) {
                let timeLeft = timeLimit;
                document.getElementById('timeLeft').textContent = timeLeft;
                
                if (timer) clearInterval(timer);
                
                timer = setInterval(() => {
                  timeLeft--;
                  document.getElementById('timeLeft').textContent = timeLeft;
                  
                  if (timeLeft <= 10) {
                    document.getElementById('timeLeft').style.color = '#dc2626';
                  }
                  
                  if (timeLeft <= 0) {
                    clearInterval(timer);
                    showResult(false, 'Temps écoulé ! Défi échoué.', currentChallenge.solution);
                  }
                }, 1000);
              }
              
              function showResult(success, message, correctAnswer, timeTaken) {
                const container = document.getElementById('resultContainer');
                container.style.display = 'block';
                container.style.backgroundColor = success ? '#f0fdf4' : '#fef2f2';
                container.style.border = success ? '2px solid #bbf7d0' : '2px solid #fecaca';
                container.style.color = success ? '#166534' : '#dc2626';
                
                let html = '<h3 style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">' +
                          (success ? '🎉 Succès !' : '❌ Échec') + '</h3>';
                html += '<p style="font-size: 16px;">' + message + '</p>';
                
                if (timeTaken) {
                  html += '<p>⏱️ Résolu en ' + timeTaken + ' secondes</p>';
                }
                
                if (correctAnswer) {
                  html += '<p>💡 La bonne réponse était: <strong>' + correctAnswer + '</strong></p>';
                }
                
                container.innerHTML = html;
                
                if (success) {
                  document.getElementById('challengeContainer').style.display = 'none';
                }
              }
            </script>
          `
        }}
      />
    </div>
  );
} 