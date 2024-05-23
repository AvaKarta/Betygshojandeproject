-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1
-- Tid vid skapande: 23 maj 2024 kl 20:48
-- Serverversion: 10.4.28-MariaDB
-- PHP-version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databas: `betygshojande`
--

-- --------------------------------------------------------

--
-- Tabellstruktur `spelarkonto`
--

CREATE TABLE `spelarkonto` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `color` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `spelarkonto`
--

INSERT INTO `spelarkonto` (`id`, `username`, `password`, `color`) VALUES
(1, 'Martin', '$2b$10$26JChfF5ULOy/Nulzd1loeWBMgiQSuAri7fm9SfyQKORO3b1uHkjy', 'Blue'),
(48, 'Ludvig', '$2b$10$fYzmVUp2qaI6v/jX4LU/se7pPP7EHkwi2VvujzQsYEjCXMsKDEzB6', 'Blue');

-- --------------------------------------------------------

--
-- Tabellstruktur `spelarstats`
--

CREATE TABLE `spelarstats` (
  `username` varchar(20) NOT NULL,
  `score` int(11) NOT NULL,
  `time` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `spelarstats`
--

INSERT INTO `spelarstats` (`username`, `score`, `time`) VALUES
('Ludvig', 2, 0),
('Martin', 0, 0);

--
-- Index för dumpade tabeller
--

--
-- Index för tabell `spelarkonto`
--
ALTER TABLE `spelarkonto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Index för tabell `spelarstats`
--
ALTER TABLE `spelarstats`
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT för dumpade tabeller
--

--
-- AUTO_INCREMENT för tabell `spelarkonto`
--
ALTER TABLE `spelarkonto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
