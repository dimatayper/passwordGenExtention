// Элементы DOM
const lengthInput = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const uppercaseInput = document.getElementById('uppercase');
const numbersInput = document.getElementById('numbers');
const symbolsInput = document.getElementById('symbols');
const generateButton = document.getElementById('generate');
const passwordOutput = document.getElementById('password-output');
const saveSettingsButton = document.getElementById('save-settings');
const tabGenerator = document.getElementById('tab-generator');
const tabHistory = document.getElementById('tab-history');
const generatorTab = document.getElementById('generator-tab');
const historyTab = document.getElementById('history-tab');
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history');

let history = [];

// Загрузка истории из хранилища
chrome.storage.sync.get('history', (data) => {
  if (data.history) {
    history = data.history;
    renderHistory();
  }
});

// Переключение вкладок
tabGenerator.addEventListener('click', () => {
  generatorTab.classList.add('active');
  historyTab.classList.remove('active');
  tabGenerator.classList.add('active');
  tabHistory.classList.remove('active');
});

tabHistory.addEventListener('click', () => {
  historyTab.classList.add('active');
  generatorTab.classList.remove('active');
  tabHistory.classList.add('active');
  tabGenerator.classList.remove('active');
});

// Обновление значения длины пароля
lengthInput.addEventListener('input', () => {
  lengthValue.textContent = lengthInput.value;
});

// Генерация пароля
generateButton.addEventListener('click', () => {
  const length = lengthInput.value;
  const includeUppercase = uppercaseInput.checked;
  const includeNumbers = numbersInput.checked;
  const includeSymbols = symbolsInput.checked;

  const password = generateMemorablePassword(length, includeUppercase, includeNumbers, includeSymbols);
  passwordOutput.textContent = password;

  // Добавление пароля в историю
  history.push(password);
  chrome.storage.sync.set({ history }, () => {
    renderHistory();
  });

  // Копирование в буфер обмена
  passwordOutput.addEventListener('click', () => {
    navigator.clipboard.writeText(password).then(() => {
      showNotification('Пароль скопирован в буфер обмена!');
    });
  });
});

// Сохранение настроек
saveSettingsButton.addEventListener('click', () => {
  const settings = {
    length: lengthInput.value,
    uppercase: uppercaseInput.checked,
    numbers: numbersInput.checked,
    symbols: symbolsInput.checked,
  };
  chrome.storage.sync.set({ settings }, () => {
    showNotification('Настройки сохранены!');
  });
});

// Очистка истории
clearHistoryButton.addEventListener('click', () => {
  history = [];
  chrome.storage.sync.set({ history }, () => {
    renderHistory();
    showNotification('История очищена!');
  });
});

// Рендер истории
function renderHistory() {
  historyList.innerHTML = '';
  history.forEach((password) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = password;
    historyItem.addEventListener('click', () => {
      navigator.clipboard.writeText(password).then(() => {
        showNotification('Пароль скопирован в буфер обмена!');
      });
    });
    historyList.appendChild(historyItem);
  });
}

// Улучшенный алгоритм генерации паролей
function generateMemorablePassword(length, includeUppercase, includeNumbers, includeSymbols) {
  const vowels = 'aeiou';
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';

  let password = '';

  for (let i = 0; i < length; i++) {
    if (includeSymbols && i % 4 === 3 && password.length < length) {
      // Добавляем символ каждые 4 символа
      password += symbols[Math.floor(Math.random() * symbols.length)];
    } else if (includeNumbers && i % 3 === 2 && password.length < length) {
      // Добавляем цифру каждые 3 символа
      password += numbers[Math.floor(Math.random() * numbers.length)];
    } else {
      // Чередуем гласные и согласные
      const charSet = i % 2 === 0 ? consonants : vowels;
      let char = charSet[Math.floor(Math.random() * charSet.length)];
      if (includeUppercase && Math.random() > 0.5) {
        char = char.toUpperCase();
      }
      password += char;
    }
  }

  return password.slice(0, length);
}

// Функция для показа уведомлений
function showNotification(message, duration = 2000) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}