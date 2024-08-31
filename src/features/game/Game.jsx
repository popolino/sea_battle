import classes from "./game.module.scss";
import SvgSelector from "../../components/SvgSelector";
import React, { useEffect, useState } from "react";
import Field from "../../components/field/Field";
import FieldOfOpponent from "../../components/field/FieldOfOpponent";
import clsx from "clsx";
import { useGame } from "../../contexts/gameContext";
import CustomTooltip from "../../components/CustomTooltip";
import CustomMui from "../../components/CustomMui";
import Countdown from "../../components/Countdown";
import CustomModal from "../../components/CustomModal";
import { useNavigate } from "react-router-dom";
import { checkHit, updateStatistic } from "../../api/api";

const Game = ({ roomId }) => {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const {
    placedShips,
    setPlacedShips,
    enemy,
    saveGameToLocalStorage,
    handleDeleteGame,
    currentGame,
    handleDeleteRoom,
    updateGameViaWebSocket,
    startAnimation,
    setStartAnimation,
    checkHitViaWebSocket,
    enemyShots,
    updateDestroyedShipsStats,
    shipsOfEnemy,
    destroyedShips,
    setDestroyedShips,
    ships,
    setShips,
    setShipsOfEnemy,
    gameFinished,
    winner,
  } = useGame();

  const [selectedShip, setSelectedShip] = useState(null);
  const [hoveredCell, setHoveredCell] = useState([]);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [exit, setExit] = useState(false);
  const [isValidPlacement, setIsValidPlacement] = useState(true);
  const [ready, setReady] = useState(false);
  const [firstTurn, setFirstTurn] = useState(0);
  const [enemyIsReady, setEnemyIsReady] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [myShots, setMyShots] = useState([]);

  const authUser = JSON.parse(localStorage.getItem("user"));
  const totalShips = ships.reduce((sum, ship) => sum + ship.count, 0);
  // const totalShips = 0;
  const currentGameId = localStorage.getItem("currentGameId");
  const navigate = useNavigate();

  const handleExitGame = () => {
    handleDeleteGame(currentGameId);
    handleDeleteRoom(roomId);
    setExit(false);
    navigate("/rooms");
    window.location.reload();
  };
  const handleReadyClick = () => {
    setReady(true);
    setFirstTurn(currentGame.current_turn === authUser.login ? 2 : 1);
    handleReady();
    saveGameToLocalStorage();
  };
  const handleShipClick = (ship) => {
    currentGameId &&
      currentGame.status !== "in_progress" &&
      ship.count > 0 &&
      setSelectedShip(ship);
  };
  const handleCellMouseEnter = (row, col) => {
    let validPlacement = true;
    if (selectedShip) {
      const size = selectedShip.size;
      const hoveredCells = [];
      for (let i = 0; i < size; i++) {
        let currentCell;
        if (isHorizontal) {
          if (col + i <= 10) {
            currentCell = { row, col: col + i };
          } else {
            setHoveredCell([]);
            return;
          }
        } else {
          if (rows.indexOf(row) + i <= 9) {
            currentCell = { row: rows[rows.indexOf(row) + i], col };
          } else {
            setHoveredCell([]);
            return;
          }
        }
        if (isCellNearAnotherShip(currentCell)) {
          validPlacement = false;
        }
        hoveredCells.push(currentCell);
      }
      if (validPlacement) {
        setHoveredCell(hoveredCells);
        setIsValidPlacement(true);
      } else {
        setHoveredCell(
          hoveredCells.map((cell) => ({ ...cell, invalid: true }))
        );
        setIsValidPlacement(false);
      }
    }
  };

  const handleWheelClick = (e) => {
    if (e.button === 1) {
      setIsHorizontal(!isHorizontal);
    }
  };
  const handleCellMouseLeave = () => {
    setHoveredCell([]);
  };

  const handlePlaceShip = () => {
    if (selectedShip && hoveredCell.length > 0 && isValidPlacement) {
      const direction = isHorizontal ? "horizontal" : "vertical";
      const newShipId = placedShips.length + 1; // Уникальный идентификатор корабля
      const cellsWithShipId = hoveredCell.map((cell) => ({
        id: newShipId, // Уникальный идентификатор для каждого расположения корабля
        row: cell.row,
        col: cell.col,
        shipId: selectedShip.id,
        direction: direction,
        hit: false,
      }));
      setPlacedShips((prev) => [...prev, ...cellsWithShipId]);
      setHoveredCell([]);
      setSelectedShip(null);
      setShips((prevShips) =>
        prevShips.map((ship) =>
          ship.id === selectedShip.id
            ? { ...ship, count: ship.count - 1 }
            : ship
        )
      );
    }
  };
  const isCellNearAnotherShip = (cell) => {
    const surroundingCells = getSurroundingCells(cell);
    return surroundingCells.some((surroundingCell) =>
      placedShips.some(
        (placedShip) =>
          placedShip.row === surroundingCell.row &&
          placedShip.col === surroundingCell.col
      )
    );
  };
  const getSurroundingCells = (cell) => {
    const surroundingCells = [];
    const rowIndex = rows.indexOf(cell.row);
    const col = cell.col;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (
          rowIndex + i >= 0 &&
          rowIndex + i < 10 &&
          col + j >= 1 &&
          col + j <= 10
        ) {
          surroundingCells.push({ row: rows[rowIndex + i], col: col + j });
        }
      }
    }
    return surroundingCells;
  };

  const handleReplaceShip = (shipId, row, col) => {
    const clickedCell = placedShips.find(
      (cell) => cell.row === row && cell.col === col && cell.shipId === shipId
    );
    if (!clickedCell) return;

    const isHorizontal = clickedCell.direction === "horizontal";
    const shipToReplaceCells = [];
    if (isHorizontal) {
      for (let i = 1; i <= 10; i++) {
        const cell = placedShips.find(
          (c) => c.row === row && c.col === i && c.shipId === shipId
        );
        if (cell) {
          shipToReplaceCells.push(cell);
        }
      }
    } else {
      for (let i = 0; i < rows.length; i++) {
        const cell = placedShips.find(
          (c) => c.row === rows[i] && c.col === col && c.shipId === shipId
        );
        if (cell) {
          shipToReplaceCells.push(cell);
        }
      }
    }

    if (shipToReplaceCells.length > 0) {
      const shipToReplace = ships.find((ship) => ship.id === shipId);
      if (!shipToReplace) return;
      setShips((prevShips) =>
        prevShips.map((ship) =>
          ship.id === shipId ? { ...ship, count: ship.count + 1 } : ship
        )
      );
      setPlacedShips((prevPlacedShips) =>
        prevPlacedShips.filter(
          (cell) =>
            !shipToReplaceCells.some(
              (replaceCell) =>
                replaceCell.row === cell.row && replaceCell.col === cell.col
            )
        )
      );
      setSelectedShip(shipToReplace);
    }
  };

  const handleReady = () => {
    const updatedGameData =
      currentGame.player1_login === authUser.login
        ? { player1_ready: true, player1_ships: placedShips }
        : { player2_ready: true, player2_ships: placedShips };
    updateGameViaWebSocket(currentGameId, updatedGameData);
  };
  const handleCancel = () => {
    setReady(false);
    const updatedGameData =
      currentGame.player1_login === authUser.login
        ? { player1_ready: false }
        : { player2_ready: false };
    updateGameViaWebSocket(currentGameId, updatedGameData);
  };
  const handleSelectCell = (row, col) => {
    if (currentGame.current_turn === authUser.login) {
      setSelectedCell({ row, col });
    }
  };
  const handleFight = async () => {
    try {
      const result = await checkHit(
        currentGameId,
        authUser.login,
        selectedCell
      );
      const newShot = {
        hit: result.hit,
        cell: selectedCell,
        player_login: authUser.login,
        ship_id: result.ship_id || null,
      };
      const playerKey =
        authUser.login === currentGame.player1_login
          ? "player2_ships"
          : "player1_ships";

      const updatedShips = currentGame[playerKey].map((ship) => {
        if (
          ship.id === result.ship_id &&
          ship.row === selectedCell.row &&
          ship.col === selectedCell.col
        ) {
          return {
            ...ship,
            hit: true,
          };
        }
        return ship;
      });
      if (result.hit && result.ship_id) {
        console.log("result", result);
        const tempCells = updatedShips.filter(
          (cell) => cell.id === result.ship_id
        );
        console.log("tempCells", tempCells);
        const isSunk = tempCells.every((cell) => cell.hit);

        if (
          isSunk &&
          !destroyedShips.some((ship) => ship.shipId === result.ship_id) &&
          authUser.login === result.player_login
        ) {
          const destroyedShip = {
            shipId: tempCells[0].shipId || null,
            cells: tempCells.map((cell) => ({
              row: cell.row,
              col: cell.col,
              ship_id: result.ship_id,
            })),
          };

          setDestroyedShips((prev) => [...prev, destroyedShip]);
          updateDestroyedShipsStats(tempCells[0].shipId);
          const storedDestroyedShips =
            JSON.parse(localStorage.getItem("destroyedShips")) || [];
          const updatedShips = [...storedDestroyedShips, destroyedShip];
          localStorage.setItem("destroyedShips", JSON.stringify(updatedShips));
        }
      }
      checkHitViaWebSocket(currentGameId, authUser.login, selectedCell);
      const updatedGameData = {
        moves_history: [newShot], // Отправляем только новый ход
        [playerKey]: updatedShips,
      };
      updateGameViaWebSocket(currentGameId, updatedGameData);
      setMyShots((prevShots) => [...prevShots, newShot]);
      const storedShots = JSON.parse(localStorage.getItem("myShots")) || [];
      const updatedShots = [...storedShots, newShot];
      localStorage.setItem("myShots", JSON.stringify(updatedShots));
      setSelectedCell(null);
    } catch (error) {
      console.error("Error with shot:", error);
    }
  };
  const handleClickOk = () => {
    handleDeleteGame(currentGameId);
    handleDeleteRoom(roomId);
    navigate("/rooms");
    window.location.reload();
  };
  useEffect(() => {
    if (currentGame) {
      const enemyReady =
        (currentGame.player1_login !== authUser.login &&
          currentGame.player1_ready) ||
        (currentGame.player2_login !== authUser.login &&
          currentGame.player2_ready);
      setEnemyIsReady(enemyReady);
    }
  }, [currentGame]);
  useEffect(() => {
    const savedPlacedShips = localStorage.getItem("placedShips");
    const savedMyShots = localStorage.getItem("myShots");
    const savedDestroyedShips = localStorage.getItem("destroyedShips");
    savedMyShots && setMyShots(JSON.parse(savedMyShots));
    savedPlacedShips && setPlacedShips(JSON.parse(savedPlacedShips));
    savedDestroyedShips && setDestroyedShips(JSON.parse(savedDestroyedShips));
  }, [currentGame]);

  useEffect(() => {
    const storedShipsOfEnemy = localStorage.getItem("shipsEnemyCount");
    if (storedShipsOfEnemy) {
      setShipsOfEnemy(JSON.parse(storedShipsOfEnemy));
    }
  }, []);
  useEffect(() => {
    if (gameFinished && shipsOfEnemy) {
      const statsUpdate = {
        wins: winner === authUser.login ? 1 : 0,
        loses: winner === authUser.login ? 0 : 1,
        shipsDestroyed: shipsOfEnemy,
      };
      updateStatistic(authUser.id, statsUpdate).then((r) => {});
    }
  }, [gameFinished, shipsOfEnemy]);

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes["main-container"]}>
          <Field
            hoveredCell={hoveredCell}
            onCellMouseEnter={handleCellMouseEnter}
            onCellMouseLeave={handleCellMouseLeave}
            handleWheelClick={handleWheelClick}
            placedShips={placedShips}
            onPlaceShip={handlePlaceShip}
            onReplaceShip={handleReplaceShip}
            ships={ships}
            enemyShots={enemyShots}
            progressGame={currentGame && currentGame.status === "in_progress"}
          />
          <div className={classes.ships}>
            <div>
              {ships.slice(0, 2).map((ship) => (
                <div
                  key={ship.id}
                  className={clsx(
                    classes["ship-container"],
                    selectedShip &&
                      ship.id === selectedShip.id &&
                      classes.selected
                  )}
                  onClick={() => handleShipClick(ship)}
                >
                  <SvgSelector id={ship.id} />
                  <p>
                    {ship.size}x cage: <span>{ship.count}</span>
                  </p>
                </div>
              ))}
            </div>
            <div>
              {ships.slice(2, 4).map((ship) => (
                <div
                  key={ship.id}
                  className={clsx(
                    classes["ship-container"],
                    selectedShip &&
                      ship.id === selectedShip.id &&
                      classes.selected
                  )}
                  onClick={() => handleShipClick(ship)}
                >
                  <SvgSelector id={ship.id} />
                  <p>
                    {ship.size}x cage: <span>{ship.count}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {currentGame && (
          <div className={classes.buttons}>
            {currentGame.status === "waiting" && (
              <>
                {totalShips > 0 ? (
                  <CustomTooltip title="Arrange all the ship" placement="top">
                    <span>
                      <button disabled={totalShips > 0}>Ready</button>
                    </span>
                  </CustomTooltip>
                ) : (
                  <span>
                    <button
                      disabled={totalShips > 0 || ready}
                      onClick={handleReadyClick}
                    >
                      Ready
                    </button>
                  </span>
                )}
                <p className={clsx(enemyIsReady ? "" : classes.disabled)}>
                  {enemyIsReady && enemy
                    ? `${enemy.name} is ready`
                    : `${enemy && enemy.name} not ready`}
                </p>
              </>
            )}
            {currentGame.status === "in_progress" && (
              <>
                <h2 className={classes.move}>
                  {currentGame.current_turn === authUser.login
                    ? "Your move now"
                    : "Enemy's move now"}
                </h2>
                <button
                  className={classes.fire}
                  disabled={!selectedCell}
                  onClick={handleFight}
                >
                  <p>Fight!</p>
                  <SvgSelector id="fire" />
                </button>
              </>
            )}
          </div>
        )}
        <div className={classes["main-container"]}>
          <FieldOfOpponent
            selectedCell={selectedCell}
            handleSelectCell={handleSelectCell}
            shots={myShots}
            destroyedShips={destroyedShips}
          />
          <div className={clsx(classes.ships, classes.opponent)}>
            <div>
              {shipsOfEnemy.slice(0, 2).map((ship) => (
                <div
                  key={ship.id}
                  className={clsx(
                    classes["ship-container"],
                    classes["opponent-ship"]
                  )}
                >
                  <SvgSelector id={ship.id} />
                  <p>
                    {ship.size}x cage: <span>{ship.destroyed}</span>
                  </p>
                </div>
              ))}
            </div>
            <div>
              {shipsOfEnemy.slice(2, 4).map((ship) => (
                <div
                  key={ship.id}
                  className={clsx(
                    classes["ship-container"],
                    classes["opponent-ship"]
                  )}
                >
                  <SvgSelector id={ship.id} />
                  <p>
                    {ship.size}x cage: <span>{ship.destroyed}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {ready && currentGame && currentGame.status === "waiting" && (
          <CustomModal
            open={ready}
            onClose={() => setReady(false)}
            children={
              <div className={classes.modal}>
                <h3>
                  Waiting for <span>{enemy.name}</span>
                </h3>
                <SvgSelector id="loader" />
                <CustomMui
                  buttonType="button"
                  variant="button"
                  onClick={handleCancel}
                  text="Cancel"
                />
              </div>
            }
          />
        )}
        {exit && (
          <CustomModal
            open={exit}
            onClose={() => setExit(false)}
            children={
              <div className={classes.modal}>
                <h2>This game will be over.</h2>
                <p>Are you sure?</p>
                <CustomMui
                  buttonType="button"
                  variant="button"
                  onClick={handleExitGame}
                  text="Yes"
                />
              </div>
            }
          />
        )}
        {gameFinished && (
          <CustomModal
            open={gameFinished}
            onClose={() => {}}
            children={
              <div className={classes.modal}>
                <h4 className={authUser.login === winner ? classes.winner : ""}>
                  <span>{authUser.login === winner ? "You" : winner}</span> are
                  winner!
                </h4>
                <p>Game over</p>
                <CustomMui
                  buttonType="button"
                  variant="button"
                  onClick={handleClickOk}
                  text="Ok"
                />
              </div>
            }
          />
        )}
        {!gameFinished && startAnimation && (
          <Countdown
            open={startAnimation}
            setOpen={setStartAnimation}
            firstTurn={firstTurn}
          />
        )}
      </div>
      <button className={classes.exit} onClick={() => setExit(true)}>
        Exit
      </button>
    </div>
  );
};

export default Game;
