-- phpMyAdmin SQL Dump
-- version 4.8.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 04, 2018 at 10:56 PM
-- Server version: 5.7.19
-- PHP Version: 7.1.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mb`
--

-- --------------------------------------------------------

--
-- Table structure for table `bet`
--

CREATE TABLE `bet` (
  `id` bigint(15) NOT NULL,
  `code` varchar(127) NOT NULL,
  `description` varchar(63) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `bet`
--

INSERT INTO `bet` (`id`, `code`, `description`, `created_at`, `updated_at`, `deleted`, `deleted_at`) VALUES
(1, '1', 'Home win', '2018-11-03 09:03:04', '2018-11-03 08:03:04', 0, NULL),
(2, '1X', 'Home win or Draw', '2018-11-03 09:03:04', '2018-11-03 08:08:11', 0, NULL),
(3, 'X2', 'Draw or Away win', '2018-11-03 09:03:59', '2018-11-03 08:03:59', 0, NULL),
(4, '2', 'Away win', '2018-11-03 09:03:59', '2018-11-03 08:03:59', 0, NULL),
(5, 'GG', 'Both teams to score - Yes', '2018-11-03 09:04:48', '2018-11-03 08:04:48', 0, NULL),
(6, 'NG', 'Both teams to score - No', '2018-11-03 09:04:48', '2018-11-03 08:04:48', 0, NULL),
(7, 'X', 'Draw', '2018-11-03 09:05:37', '2018-11-03 08:05:37', 0, NULL),
(8, 'U1.5', 'Under 1.5 Goals', '2018-11-03 09:05:37', '2018-11-03 08:05:37', 0, NULL),
(9, 'U2.5', 'Under 2.5 Goals', '2018-11-03 09:06:10', '2018-11-03 08:06:10', 0, NULL),
(10, 'U3.5', 'Under 3.5 Goals', '2018-11-03 09:06:10', '2018-11-03 08:06:10', 0, NULL),
(11, 'U4.5', 'Under 4.5 Goals', '2018-11-03 09:06:48', '2018-11-03 08:06:48', 0, NULL),
(12, 'O1.5', 'Over 1.5 Goals', '2018-11-03 09:06:48', '2018-11-03 08:06:48', 0, NULL),
(13, 'O2.5', 'Over 2.5 Goals', '2018-11-03 09:07:09', '2018-11-03 08:07:09', 0, NULL),
(14, 'O3.5', 'Over 3.5 Goals', '2018-11-03 09:07:09', '2018-11-03 08:07:09', 0, NULL),
(15, 'O4.5', 'Over 4.5 Goals', '2018-11-03 09:07:48', '2018-11-03 08:07:48', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `id` bigint(15) NOT NULL,
  `id_ticket` bigint(15) NOT NULL,
  `id_match` bigint(15) NOT NULL,
  `id_bet` varchar(127) NOT NULL,
  `odd` float NOT NULL,
  `outcome` tinyint(1) NOT NULL COMMENT '0-Pending; 1-Won; 2-Lost; 3-Cancelled',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`id`, `id_ticket`, `id_match`, `id_bet`, `odd`, `outcome`, `created_at`, `updated_at`, `deleted`, `deleted_at`) VALUES
(1, 1, 3, '3', 1.65, 0, '2018-11-01 10:57:25', '2018-11-03 08:11:16', 0, NULL),
(2, 2, 1, '1', 2.3, 0, '2018-11-01 10:57:25', '2018-11-03 07:57:50', 0, NULL),
(3, 1, 4, '4', 1.4, 0, '2018-11-01 10:57:25', '2018-11-03 08:12:55', 0, NULL),
(4, 3, 3, '3', 1.65, 0, '2018-11-02 14:35:22', '2018-11-03 08:11:16', 0, NULL),
(5, 3, 4, '2', 1.4, 0, '2018-11-02 14:35:22', '2018-11-03 08:11:44', 0, NULL),
(6, 3, 13, '1', 1.85, 0, '2018-11-02 14:41:45', '2018-11-03 07:58:02', 0, NULL),
(7, 3, 12, '1', 1.4, 0, '2018-11-02 14:41:45', '2018-11-03 07:58:02', 0, NULL),
(8, 3, 1, '3', 2.1, 0, '2018-11-02 14:41:45', '2018-11-03 08:11:16', 0, NULL),
(9, 3, 11, '2', 2.3, 0, '2018-11-02 14:45:30', '2018-11-03 07:58:02', 0, NULL),
(10, 3, 2, '3', 1.95, 0, '2018-11-02 14:45:30', '2018-11-03 08:11:16', 0, NULL),
(11, 3, 10, '2', 1.8, 0, '2018-11-02 14:45:30', '2018-11-03 07:58:02', 0, NULL),
(12, 3, 7, '4', 2, 0, '2018-11-02 14:45:30', '2018-11-03 08:13:01', 0, NULL),
(13, 4, 3, '3', 1.65, 0, '2018-11-03 08:29:07', '2018-11-03 08:11:16', 0, NULL),
(14, 4, 4, '2', 1.4, 0, '2018-11-03 08:29:07', '2018-11-03 08:11:44', 0, NULL),
(15, 4, 13, '1', 1.7, 0, '2018-11-03 08:29:08', '2018-11-03 07:58:16', 0, NULL),
(16, 4, 11, '3', 5, 0, '2018-11-03 08:29:08', '2018-11-03 08:11:16', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `club`
--

CREATE TABLE `club` (
  `id` int(11) NOT NULL,
  `_key` varchar(63) DEFAULT NULL,
  `code` varchar(63) DEFAULT NULL,
  `name` varchar(127) DEFAULT NULL,
  `id_league` int(10) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `club`
--

INSERT INTO `club` (`id`, `_key`, `code`, `name`, `id_league`, `created_at`, `updated_at`, `deleted`, `deleted_at`) VALUES
(1, 'chelsea', 'CHE', 'Chelsea', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(2, 'arsenal', 'ARS', 'Arsenal', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(3, 'tottenham', 'TOT', 'Tottenham Hotspur', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(4, 'westham', 'WHU', 'West Ham United', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(5, 'crystalpalace', 'CRY', 'Crystal Palace', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(6, 'manutd', 'MUN', 'Manchester United', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(7, 'mancity', 'MCI', 'Manchester City', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(8, 'everton', 'EVE', 'Everton', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(9, 'liverpool', 'LIV', 'Liverpool', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(10, 'westbrom', 'WBA', 'West Bromwich Albion', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(11, 'newcastle', 'NEW', 'Newcastle United', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(12, 'stoke', 'STK', 'Stoke City', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(13, 'southampton', 'SOU', 'Southampton', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(14, 'leicester', 'LEI', 'Leicester City', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(15, 'bournemouth', 'BOU', 'Bournemouth', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(16, 'watford', 'WAT', 'Watford', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(17, 'brightonhovealbion', 'BHA', 'Brighton and Hove Albion', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(18, 'burnley', 'BUR', 'Burnley', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(19, 'huddersfieldtown', 'HFT', 'Huddersfield Town', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(20, 'swansea', 'SWA', 'Swansea', 1, '2018-10-19 17:46:53', '2018-10-26 15:51:43', 0, '0000-00-00 00:00:00'),
(22, 'juventus', 'JUV', 'Juventus', 5, '2018-10-26 17:05:47', '2018-10-26 19:11:59', 0, '0000-00-00 00:00:00'),
(23, 'psg', 'PSG', 'Paris Saint Germain', 7, '2018-10-26 18:25:13', '2018-10-26 19:12:02', 0, '0000-00-00 00:00:00'),
(24, 'ACMilan', 'ACM', 'AC Milan', 5, '2018-10-29 19:48:31', '2018-10-29 18:48:31', 0, '0000-00-00 00:00:00'),
(25, 'SaintEtienne', 'STE', 'Saint Etienne', 7, '2018-10-31 15:02:08', '2018-10-31 14:02:08', 0, NULL),
(26, 'Barcelona', 'FCB', 'FC Barcelona', 4, '2018-10-31 15:27:15', '2018-10-31 14:27:15', 0, NULL),
(27, 'RealMadrid', 'RMA', 'Real Madrid', 4, '2018-10-31 15:28:19', '2018-10-31 14:28:19', 0, NULL),
(28, 'espanyol', 'ESP', 'Espanyol', 4, '2018-10-31 15:28:43', '2018-10-31 14:28:43', 0, NULL),
(29, 'eibar', 'EIB', 'Eibar', 4, '2018-10-31 15:29:19', '2018-10-31 14:29:19', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `country`
--

CREATE TABLE `country` (
  `id` int(11) NOT NULL,
  `country` varchar(200) NOT NULL,
  `nationality` varchar(200) NOT NULL,
  `iso_code` varchar(5) NOT NULL,
  `phone_code` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `country`
--

INSERT INTO `country` (`id`, `country`, `nationality`, `iso_code`, `phone_code`, `created_at`, `updated_at`, `deleted`, `deleted_at`) VALUES
(3, 'USA', 'American', 'US', '1', '2018-08-16 13:28:04', '2018-10-24 10:48:46', 0, '0000-00-00 00:00:00'),
(4, 'United Kingdom', 'British', 'GB', '44', '2018-08-16 13:28:04', '2018-10-31 12:12:27', 1, '0000-00-00 00:00:00'),
(5, 'England', 'English', 'ENG', '44', '2018-10-24 10:51:34', '2018-10-24 10:53:17', 0, '0000-00-00 00:00:00'),
(6, 'Scotland', 'Scottish', 'SCO', '44', '2018-10-24 10:51:34', '2018-10-24 10:53:20', 0, '0000-00-00 00:00:00'),
(7, 'Wales', 'Welsh', 'WAL', '44', '2018-10-24 10:52:42', '2018-10-24 10:53:23', 0, '0000-00-00 00:00:00'),
(19, 'Australia', 'Australian', 'AU', '61', '2018-08-16 13:30:09', '2018-08-16 13:30:09', 0, '0000-00-00 00:00:00'),
(20, 'Austria', 'Austrian', 'AT', '43', '2018-08-16 13:30:09', '2018-08-16 13:30:09', 0, '0000-00-00 00:00:00'),
(27, 'Belgium', 'Belgian', 'BE', '32', '2018-08-16 13:30:10', '2018-08-16 13:30:10', 0, '0000-00-00 00:00:00'),
(36, 'Brazil', 'Brazilian', 'BR', '55', '2018-08-16 13:30:12', '2018-08-16 13:30:12', 0, '0000-00-00 00:00:00'),
(49, 'Chile', 'Chilean', 'CL', '56', '2018-08-16 13:30:14', '2018-08-16 13:30:14', 0, '0000-00-00 00:00:00'),
(50, 'China', 'Chinese', 'CN', '86', '2018-08-16 13:30:14', '2018-08-16 13:30:14', 0, '0000-00-00 00:00:00'),
(53, 'Colombia', 'Colombian', 'CO', '57', '2018-08-16 13:30:14', '2018-08-16 13:30:14', 0, '0000-00-00 00:00:00'),
(58, 'Costa Rica', 'Costa Rican', 'CR', '506', '2018-08-16 13:30:15', '2018-08-16 13:30:15', 0, '0000-00-00 00:00:00'),
(60, 'Croatia (Hrvatska)', 'Croatia (Hrvatska)', 'HR', '385', '2018-08-16 13:30:16', '2018-08-16 13:30:16', 0, '0000-00-00 00:00:00'),
(63, 'Czech Republic', 'Czech', 'CZ', '420', '2018-08-16 13:30:16', '2018-08-16 13:30:16', 0, '0000-00-00 00:00:00'),
(64, 'Denmark', 'Denmark', 'DK', '45', '2018-08-16 13:30:16', '2018-08-16 13:30:16', 0, '0000-00-00 00:00:00'),
(69, 'Ecuador', 'Ecuadorean', 'EC', '593', '2018-08-16 13:30:17', '2018-08-16 13:30:17', 0, '0000-00-00 00:00:00'),
(74, 'Estonia', 'Estonian', 'EE', '372', '2018-08-16 13:30:18', '2018-08-16 13:30:18', 0, '0000-00-00 00:00:00'),
(81, 'France', 'French', 'FR', '33', '2018-08-16 13:30:19', '2018-08-16 13:30:19', 0, '0000-00-00 00:00:00'),
(88, 'Germany', 'German', 'DE', '49', '2018-08-16 13:30:20', '2018-08-16 13:30:20', 0, '0000-00-00 00:00:00'),
(103, 'Honduras', 'Honduran', 'HN', '504', '2018-08-16 13:30:23', '2018-08-16 13:30:23', 0, '0000-00-00 00:00:00'),
(105, 'Hungary', 'Hungarian', 'HU', '36', '2018-08-16 13:30:23', '2018-08-16 13:30:23', 0, '0000-00-00 00:00:00'),
(110, 'Ireland', 'Irish', 'IE', '353', '2018-08-16 13:30:24', '2018-08-16 13:30:24', 0, '0000-00-00 00:00:00'),
(111, 'Israel', 'Isreali', 'IL', '972', '2018-08-16 13:30:24', '2018-08-16 13:30:24', 0, '0000-00-00 00:00:00'),
(112, 'Italy', 'Italian', 'IT', '39', '2018-08-16 13:30:24', '2018-08-16 13:30:24', 0, '0000-00-00 00:00:00'),
(114, 'Japan', 'Japanese', 'JP', '81', '2018-08-16 13:30:24', '2018-08-16 13:30:24', 0, '0000-00-00 00:00:00'),
(117, 'Kazakhstan', 'Kazakhstani', 'KZ', '7', '2018-08-16 13:30:25', '2018-08-16 13:30:25', 0, '0000-00-00 00:00:00'),
(121, 'Korea South', 'Korea South', 'KR', '82', '2018-08-16 13:30:25', '2018-08-16 13:30:25', 0, '0000-00-00 00:00:00'),
(125, 'Latvia', 'Latvian', 'LV', '371', '2018-08-16 13:30:26', '2018-08-16 13:30:26', 0, '0000-00-00 00:00:00'),
(147, 'Mexico', 'Mexican', 'MX', '52', '2018-08-16 13:30:29', '2018-08-16 13:30:29', 0, '0000-00-00 00:00:00'),
(160, 'Netherlands', 'Netherlands The', 'NL', '31', '2018-08-16 13:30:31', '2018-10-26 16:09:52', 0, '0000-00-00 00:00:00'),
(169, 'Norway', 'Norwegian', 'NO', '47', '2018-08-16 13:30:33', '2018-08-16 13:30:33', 0, '0000-00-00 00:00:00'),
(180, 'Poland', 'Polish', 'PL', '48', '2018-08-16 13:30:35', '2018-08-16 13:30:35', 0, '0000-00-00 00:00:00'),
(181, 'Portugal', 'Portugese', 'PT', '351', '2018-08-16 13:30:35', '2018-08-16 13:30:35', 0, '0000-00-00 00:00:00'),
(185, 'Romania', 'Romanian', 'RO', '40', '2018-08-16 13:30:35', '2018-08-16 13:30:35', 0, '0000-00-00 00:00:00'),
(186, 'Russia', 'Russian', 'RU', '70', '2018-08-16 13:30:35', '2018-08-16 13:30:35', 0, '0000-00-00 00:00:00'),
(201, 'Singapore', 'Singaporean', 'SG', '65', '2018-08-16 13:30:38', '2018-08-16 13:30:38', 0, '0000-00-00 00:00:00'),
(202, 'Slovakia', 'Slovakia', 'SK', '421', '2018-08-16 13:30:39', '2018-08-16 13:30:39', 0, '0000-00-00 00:00:00'),
(203, 'Slovenia', 'Slovenian', 'SI', '386', '2018-08-16 13:30:39', '2018-08-16 13:30:39', 0, '0000-00-00 00:00:00'),
(207, 'South Africa', 'South African', 'ZA', '27', '2018-08-16 13:30:39', '2018-08-16 13:30:39', 0, '0000-00-00 00:00:00'),
(210, 'Spain', 'Spanish', 'ES', '34', '2018-08-16 13:30:40', '2018-08-16 13:30:40', 0, '0000-00-00 00:00:00'),
(216, 'Sweden', 'Sweden', 'SE', '46', '2018-08-16 13:30:41', '2018-08-16 13:30:41', 0, '0000-00-00 00:00:00'),
(217, 'Switzerland', 'Switzerland', 'CH', '41', '2018-08-16 13:30:41', '2018-08-16 13:30:41', 0, '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `league`
--

CREATE TABLE `league` (
  `id` int(11) NOT NULL,
  `_key` varchar(63) DEFAULT NULL,
  `name` varchar(127) DEFAULT NULL,
  `id_country` int(10) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `league`
--

INSERT INTO `league` (`id`, `_key`, `name`, `id_country`, `status`, `created_at`, `updated_at`, `deleted`, `deleted_at`) VALUES
(1, 'EPL', 'English Premier League', 5, 1, '2018-10-25 19:27:56', '2018-10-25 18:27:56', 0, '0000-00-00 00:00:00'),
(2, 'EngChamp', 'Championship', 5, 1, '2018-10-25 19:54:10', '2018-10-26 05:38:12', 0, '0000-00-00 00:00:00'),
(3, 'BraSerieA', 'Serie A', 36, 1, '2018-10-25 23:22:24', '2018-10-26 05:38:03', 0, '0000-00-00 00:00:00'),
(4, 'LaLiga', 'La Liga', 210, 1, '2018-10-26 06:44:39', '2018-10-26 05:44:39', 0, '0000-00-00 00:00:00'),
(5, 'ItaSerieA', 'Serie A', 112, 1, '2018-10-26 06:45:54', '2018-10-26 05:45:54', 0, '0000-00-00 00:00:00'),
(6, 'ItaSerieB', 'Serie B', 112, 1, '2018-10-26 06:46:12', '2018-10-26 05:46:12', 0, '0000-00-00 00:00:00'),
(7, 'FraLigue1', 'Ligue 1', 81, 1, '2018-10-26 06:47:11', '2018-10-26 05:47:11', 0, '0000-00-00 00:00:00'),
(8, 'FraLigue2', 'Ligue 2', 81, 1, '2018-10-26 06:47:20', '2018-10-26 05:47:20', 0, '0000-00-00 00:00:00'),
(9, 'GerBundesliga', 'Bundesliga', 88, 1, '2018-10-26 06:47:41', '2018-10-26 05:47:41', 0, '0000-00-00 00:00:00'),
(10, 'Ger2Bundesliga', '2.Bundesliga', 88, 1, '2018-10-26 06:47:57', '2018-10-26 05:47:57', 0, '0000-00-00 00:00:00'),
(11, 'MLS', 'Major League Soccer', 3, 1, '2018-10-26 06:48:25', '2018-10-26 05:48:25', 0, '0000-00-00 00:00:00'),
(12, 'ScoPremier', 'Premier League', 6, 1, '2018-10-26 06:49:12', '2018-10-26 05:49:12', 0, '0000-00-00 00:00:00'),
(13, 'BraSerieB', 'Serie B', 36, 1, '2018-10-26 06:49:44', '2018-10-26 05:49:44', 0, '0000-00-00 00:00:00'),
(14, 'NetEredivisie', 'Eredivisie', 160, 1, '2018-10-26 06:50:28', '2018-10-26 05:50:28', 0, '0000-00-00 00:00:00'),
(15, 'NetErsteDivisie', 'Erste Divisie', 160, 1, '2018-10-26 06:50:51', '2018-10-26 05:50:51', 0, '0000-00-00 00:00:00'),
(16, 'HunOTPBankLiga', 'OTP Bank Liga', 105, 1, '2018-10-26 08:29:00', '2018-10-26 07:29:00', 0, '0000-00-00 00:00:00'),
(17, 'JpnJLeague', 'J League', 114, 1, '2018-10-26 08:31:06', '2018-10-26 07:31:06', 0, '0000-00-00 00:00:00'),
(18, 'WelshPremier', 'Welsh Premier League', 7, 1, '2018-10-26 08:35:45', '2018-10-26 07:35:45', 0, '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `id` int(11) NOT NULL,
  `season` varchar(63) NOT NULL,
  `id_club_1` int(10) DEFAULT NULL,
  `id_club_2` int(10) DEFAULT NULL,
  `id_league` int(10) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0-Pending; 1-Playing; 2-Finished; 3-Cancelled',
  `id_stadium` int(10) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `matches`
--

INSERT INTO `matches` (`id`, `season`, `id_club_1`, `id_club_2`, `id_league`, `date`, `time`, `status`, `id_stadium`, `created_at`, `updated_at`, `deleted`, `deleted_at`) VALUES
(1, '2017 / 2018', 6, 9, 1, '2018-10-26', '14:00:00', 0, 0, '2018-10-29 18:36:51', '2018-10-29 17:36:51', 0, '0000-00-00 00:00:00'),
(2, '2018 / 2019', 8, 3, 1, '2018-10-29', '10:00:00', 0, 0, '2018-10-29 18:59:00', '2018-10-29 17:59:00', 0, '0000-00-00 00:00:00'),
(3, '2018 / 2019', 1, 2, 1, '2018-10-28', '17:00:00', 0, 0, '2018-10-29 19:47:45', '2018-10-29 18:47:45', 0, '0000-00-00 00:00:00'),
(4, '2017 / 2018', 24, 22, 5, '2018-10-10', '19:45:00', 0, 0, '2018-10-29 19:49:58', '2018-10-29 18:49:58', 0, '0000-00-00 00:00:00'),
(5, '2018 / 2019', 4, 5, 1, '2018-10-30', '03:00:00', 0, 0, '2018-10-31 13:11:47', '2018-10-31 12:11:47', 0, NULL),
(7, '2018 / 2019', 20, 7, 1, '2018-10-30', '15:00:00', 0, 0, '2018-10-31 13:54:13', '2018-10-31 12:54:13', 0, NULL),
(8, '2018 / 2019', 15, 12, 1, '2018-10-31', '16:00:00', 0, 0, '2018-10-31 13:56:03', '2018-10-31 12:56:03', 0, NULL),
(9, '2018 / 2019', 18, 10, 1, '2018-10-30', '13:30:00', 0, 0, '2018-10-31 14:54:08', '2018-10-31 13:54:08', 0, NULL),
(10, '2018 / 2019', 25, 23, 7, '2018-10-30', '12:45:00', 0, 0, '2018-10-31 15:14:42', '2018-10-31 14:14:42', 0, NULL),
(11, '2018 / 2019', 28, 27, 4, '2018-10-30', '19:45:00', 0, 0, '2018-10-31 15:29:53', '2018-10-31 14:29:53', 0, NULL),
(12, '2018 / 2019', 26, 29, 4, '2018-10-31', '19:45:00', 0, 0, '2018-10-31 15:30:24', '2018-10-31 14:30:24', 0, NULL),
(13, '2018 / 2019', 16, 19, 1, '2018-10-30', '16:00:00', 0, 0, '2018-10-31 15:32:41', '2018-10-31 14:32:41', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

CREATE TABLE `ticket` (
  `id` int(11) NOT NULL,
  `name` varchar(60) NOT NULL,
  `stake` float NOT NULL,
  `status` tinyint(1) NOT NULL COMMENT '0-Pending; 1-Active; 2-Done',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`id`, `name`, `stake`, `status`, `created_at`, `updated_at`, `deleted`, `deleted_at`) VALUES
(1, 'Combo', 50, 0, '2018-11-01 10:57:25', '2018-11-01 09:57:25', 0, NULL),
(2, 'XMen', 100, 0, '2018-11-01 10:57:25', '2018-11-01 15:13:31', 0, NULL),
(3, 'Suite1', 50, 0, '2018-11-01 10:57:25', '2018-11-03 08:26:42', 0, NULL),
(4, 'Kdjol', 50, 0, '2018-11-02 14:35:22', '2018-11-03 08:27:37', 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bet`
--
ALTER TABLE `bet`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `club`
--
ALTER TABLE `club`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `country`
--
ALTER TABLE `country`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD UNIQUE KEY `country` (`country`),
  ADD UNIQUE KEY `nationality` (`nationality`),
  ADD UNIQUE KEY `iso_code` (`iso_code`);

--
-- Indexes for table `league`
--
ALTER TABLE `league`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bet`
--
ALTER TABLE `bet`
  MODIFY `id` bigint(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `id` bigint(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `club`
--
ALTER TABLE `club`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `country`
--
ALTER TABLE `country`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=218;

--
-- AUTO_INCREMENT for table `league`
--
ALTER TABLE `league`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
