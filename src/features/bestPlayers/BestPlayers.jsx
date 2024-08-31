import React, { useEffect, useState } from "react";
import classes from "./bestPlayers.module.scss";
import { getPlayersRating } from "../../api/api";

const BestPlayers = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    getPlayersRating().then((response) => {
      const topPlayers = response
        .sort(
          (a, b) => parseFloat(b.win_percentage) - parseFloat(a.win_percentage)
        )
        .slice(0, 3);
      setPlayers(topPlayers);
    });
  }, []);

  if (players) {
    return (
      <div className={classes.container}>
        <h1>Best Players: </h1>
        <div className={classes.content}>
          {players.map((player, index) => (
            <div key={index}>
              <p>{index + 1}.</p>
              <div className={classes.item}>
                <table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Winrate</th>
                      <th>Game Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{player.name}</td>
                      <td>{player.win_percentage}</td>
                      <td>{player.game_count}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else return <div>404</div>;
};

export default BestPlayers;
