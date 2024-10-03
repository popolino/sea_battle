Данный проект реализован в рамках программы School 21 Frontend Bootcamp и представляет собой онлайн-версию игры "Морской бой", разработанную с использованием современных технологий для фронтенда и бэкенда. 
Игра реализована с возможностью реального времени, авторизации пользователей и ведения статистики.

### Особенности проекта

- Реализация игры "Морской бой" с логикой очередности ходов и атаки кораблей.
- Реальное время с использованием WebSocket для обновления игры и ходов игроков.
- Система авторизации и регистрации пользователей с помощью JWT.
- Сохранение статистики пользователей: количество игр, побед, поражений и уничтоженных кораблей.
- Современный дизайн, созданный с помощью Figma.

### Этапы разработки

1. Разработка макета интерфейса игры в Figma.
2. Вёрстка с использованием HTML, CSS, SASS, и React для создания интерактивного интерфейса.
3. Создание базы данных и сервера:
   - &nbsp;&nbsp;&nbsp;&nbsp; Разработка структуры базы данных на PostgreSQL для хранения данных о пользователях, играх и статистике.
   - &nbsp;&nbsp;&nbsp;&nbsp; Реализация сервера на Node.js с использованием Express.js для API и WebSocket для взаимодействия игроков.
5. Авторизация и аутентификация:
   - &nbsp;&nbsp;&nbsp;&nbsp; Добавление JWT токенов для безопасной авторизации и аутентификации пользователей.
6. Реализация игровой логики:
   - &nbsp;&nbsp;&nbsp;&nbsp; Внедрение основной игровой логики с системой ходов и атак.
   - &nbsp;&nbsp;&nbsp;&nbsp; Реализация обновления состояния игры в реальном времени с помощью WebSocket.
7. Подсчёт и отображение статистики игроков, включая количество побед, поражений и уничтоженных кораблей.

Проект был размещён на сервере с помощью хостинга RUVDS. Сервер не может быть доступен постоянно, но для демонстрации работы игры представлено видео ниже.

[Посмотреть демонстрацию игры](https://drive.google.com/file/d/1jB0w-zqOEwE8l1dGNpfRnyekMyNx4PgK/view?usp=sharing)

