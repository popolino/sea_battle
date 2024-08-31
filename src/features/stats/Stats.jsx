import classes from "./stats.module.scss";
import React, { useEffect, useState } from "react";
import SvgSelector from "../../components/SvgSelector";
import { getUserStatistics } from "../../api/api";

const Stats = () => {
  const authUser = JSON.parse(localStorage.getItem("user"));
  const [statistic, setStatistic] = useState(null);

  const fetchStatistics = async () => {
    const userId = authUser.id;
    try {
      const statistics = await getUserStatistics(userId);
      setStatistic(statistics);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };
  useEffect(() => {
    fetchStatistics().then((r) => {});
  }, []);

  if (statistic) {
    return (
      <div className={classes.container}>
        <h1>Game Stats:</h1>
        <div className={classes.content}>
          <div className={classes["left-container"]}>
            <table>
              <tbody>
                <tr>
                  <td>Game played: </td>
                  <td>{statistic.game_count}</td>
                </tr>
                <tr>
                  <td>Win rate:</td>
                  <td>
                    {statistic.wins + statistic.loses > 0
                      ? (
                          (statistic.wins /
                            (statistic.wins + statistic.loses)) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={classes["right-container"]}>
            <p>
              Ships destroyed: <span>{statistic.ships_destroyed}</span>
            </p>
            <table>
              <tbody>
                <tr>
                  <td>
                    <SvgSelector id="ship4" />
                  </td>
                  <td>4x cage:</td>
                  <td>{statistic.ships_stats["4x cage"]}</td>
                </tr>
                <tr>
                  <td>
                    <SvgSelector id="ship3" />
                  </td>
                  <td>3x cage:</td>
                  <td>{statistic.ships_stats["3x cage"]}</td>
                </tr>
                <tr>
                  <td>
                    <SvgSelector id="ship2" />
                  </td>
                  <td>2x cage:</td>
                  <td>{statistic.ships_stats["2x cage"]}</td>
                </tr>
                <tr>
                  <td>
                    <SvgSelector id="ship1" />
                  </td>
                  <td>1x cage:</td>
                  <td>{statistic.ships_stats["1x cage"]}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } else return <div>404</div>;
};

export default Stats;
