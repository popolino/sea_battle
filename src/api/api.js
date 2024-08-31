import axios from "axios";

export const registerUser = async (login, name, password) => {
  try {
    const response = await axios.post("http://localhost:3001/api/signup", {
      login,
      name,
      password,
    });
    console.log("User registered:", response.data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const authUser = async (login, password) => {
  try {
    const response = await axios.post("http://localhost:3001/api/signin", {
      login,
      password,
    });
    console.log("User authorized:", response.data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    console.error("Error authorization user:", error);
    throw error;
  }
};
export const logoutUser = () => {
  localStorage.removeItem("token");
};

export const getUserByLogin = async (login) => {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/users/login/${login}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const checkHit = async (gameId, playerLogin, cell) => {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/game/check-hit",
      {
        game_id: gameId,
        player_login: playerLogin,
        cell: cell,
      }
    );
    const { hit, cell: hitCell } = response.data;
    if (hit) {
      console.log(`Попадание по клетке: ${hitCell.row}${hitCell.col}`);
    } else {
      console.log(`Промах по клетке: ${hitCell.row}${hitCell.col}`);
    }

    return response.data;
  } catch (error) {
    console.error("Ошибка при проверке попадания:", error);
    throw error;
  }
};
export const getUserStatistics = async (userId) => {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/users/${userId}/statistics`
    );
    const statistics = response.data;
    console.log("User statistics:", statistics);
    return statistics;
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    throw error;
  }
};

export const updateStatistic = async (userId, statsUpdate) => {
  try {
    const response = await axios.put(
      `http://localhost:3001/api/users/${userId}/statistics`,
      statsUpdate
    );
    console.log("Статистика успешно обновлена:", response.data);
    return response.data;
  } catch (error) {
    console.error("Ошибка при обновлении статистики:", error);
    throw error;
  }
};

export const getPlayersRating = async () => {
  try {
    const response = await axios.get(
      "http://localhost:3001/api/players-rating"
    );
    return response.data; // Данные рейтинга
  } catch (error) {
    console.error("Failed to fetch players rating:", error);
    throw error;
  }
};
