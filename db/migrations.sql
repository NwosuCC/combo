-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.19 - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table bet
CREATE TABLE IF NOT EXISTS `bet` (
  `id` bigint(15) NOT NULL AUTO_INCREMENT,
  `code` varchar(127) NOT NULL,
  `description` varchar(63) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;

-- Dumping data for table bet: ~15 rows (approximately)
/*!40000 ALTER TABLE `bet` DISABLE KEYS */;
INSERT INTO `bet` (`code`, `description`) VALUES
  ('1', 'Home win'),
  ('1X', 'Home win or Draw'),
  ('X2', 'Draw or Away win'),
  ('2', 'Away win'),
  ('GG', 'Both teams to score - Yes'),
  ('NG', 'Both teams to score - No'),
  ('X', 'Draw'),
  ('U1.5', 'Under 1.5 Goals'),
  ('U2.5', 'Under 2.5 Goals'),
  ('U3.5', 'Under 3.5 Goals'),
  ('U4.5', 'Under 4.5 Goals'),
  ('O1.5', 'Over 1.5 Goals'),
  ('O2.5', 'Over 2.5 Goals'),
  ('O3.5', 'Over 3.5 Goals'),
  ('O4.5', 'Over 4.5 Goals');
/*!40000 ALTER TABLE `bet` ENABLE KEYS */;


-- Dumping structure for table booking
CREATE TABLE IF NOT EXISTS `booking` (
  `id` bigint(15) NOT NULL AUTO_INCREMENT,
  `id_ticket` bigint(15) NOT NULL,
  `pos` smallint(3) NOT NULL,
  `id_match` bigint(15) NOT NULL,
  `id_bet` varchar(127) NOT NULL,
  `odd` float NOT NULL,
  `outcome` tinyint(1) NOT NULL COMMENT '0-Pending; 1-Won; 2-Lost; 3-Cancelled',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_pos` (`id_ticket`,`pos`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;

-- Dumping data for table booking: ~33 rows (approximately)
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
INSERT INTO `booking` (`id_ticket`, `pos`, `id_match`, `id_bet`, `odd`, `outcome`) VALUES
  (2, 1, 11, '3', 1.75, 0),
  (2, 2, 3, '5', 1.65, 0),
  (2, 3, 10, '4', 1.55, 0),
  (1, 1, 3, '3', 1.65, 0),
  (1, 2, 4, '4', 1.4, 0),
  (3, 1, 3, '3', 1.5, 0),
  (3, 2, 4, '2', 1.4, 0),
  (3, 3, 13, '1', 1.35, 0),
  (3, 4, 12, '1', 1.4, 0),
  (3, 5, 1, '3', 1.65, 0),
  (3, 6, 11, '2', 1.35, 0),
  (3, 7, 2, '3', 1.7, 0),
  (3, 8, 10, '2', 1.45, 0),
  (3, 9, 7, '4', 1.55, 0),
  (4, 1, 3, '3', 1.65, 0),
  (4, 2, 4, '2', 1.4, 0),
  (4, 3, 13, '1', 1.7, 0),
  (4, 4, 11, '3', 5, 0),
  (19, 1, 10, '7', 5, 0),
  (19, 2, 8, '11', 1.8, 0),
  (19, 3, 2, '3', 2.5, 0),
  (34, 1, 1, '5', 20, 0),
  (34, 2, 7, '4', 1.6, 0),
  (34, 3, 10, '3', 1.45, 0),
  (48, 1, 8, '5', 2.1, 0),
  (48, 3, 4, '3', 3.4, 0),
  (48, 2, 3, '13', 1.3, 0),
  (48, 5, 9, '11', 1.55, 0),
  (48, 6, 9, '', 0, 0),
  (48, 4, 11, '4', 1.7, 0),
  (66, 2, 10, '8', 5, 0),
  (66, 3, 3, '1', 1.9, 0),
  (66, 5, 7, '4', 1.7, 0);
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;


-- Dumping structure for table club
CREATE TABLE IF NOT EXISTS `club` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `_key` varchar(63) DEFAULT NULL,
  `code` varchar(63) DEFAULT NULL,
  `name` varchar(127) DEFAULT NULL,
  `id_league` int(10) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;

-- Dumping data for table club: ~29 rows (approximately)
/*!40000 ALTER TABLE `club` DISABLE KEYS */;
INSERT INTO `club` (`_key`, `code`, `name`, `id_league`) VALUES
  ('chelsea', 'CHE', 'Chelsea', 1),
  ('arsenal', 'ARS', 'Arsenal', 1),
  ('tottenham', 'TOT', 'Tottenham Hotspur', 1),
  ('westham', 'WHU', 'West Ham United', 1),
  ('crystalpalace', 'CRY', 'Crystal Palace', 1),
  ('manutd', 'MUN', 'Manchester United', 1),
  ('mancity', 'MCI', 'Manchester City', 1),
  ('everton', 'EVE', 'Everton', 1),
  ('liverpool', 'LIV', 'Liverpool', 1),
  ('westbrom', 'WBA', 'West Bromwich Albion', 1),
  ('newcastle', 'NEW', 'Newcastle United', 1),
  ('stoke', 'STK', 'Stoke City', 1),
  ('southampton', 'SOU', 'Southampton', 1),
  ('leicester', 'LEI', 'Leicester City', 1),
  ('bournemouth', 'BOU', 'Bournemouth', 1),
  ('watford', 'WAT', 'Watford', 1),
  ('brightonhovealbion', 'BHA', 'Brighton and Hove Albion', 1),
  ('burnley', 'BUR', 'Burnley', 1),
  ('huddersfieldtown', 'HFT', 'Huddersfield Town', 1),
  ('swansea', 'SWA', 'Swansea', 1),
  ('juventus', 'JUV', 'Juventus', 5),
  ('psg', 'PSG', 'Paris Saint Germain', 7),
  ('ACMilan', 'ACM', 'AC Milan', 5),
  ('SaintEtienne', 'STE', 'Saint Etienne', 7),
  ('Barcelona', 'FCB', 'FC Barcelona', 4),
  ('RealMadrid', 'RMA', 'Real Madrid', 4),
  ('espanyol', 'ESP', 'Espanyol', 4),
  ('eibar', 'EIB', 'Eibar', 4),
  ('deportivo', 'DLC', 'Deportivo La Coruna', 8),
  ('monaco', 'MNA', 'Monaco', 7),
  ('angers', 'AGR', 'Angers', 7);
/*!40000 ALTER TABLE `club` ENABLE KEYS */;


-- Dumping structure for table country
CREATE TABLE IF NOT EXISTS `country` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `country` varchar(200) NOT NULL,
  `nationality` varchar(200) NOT NULL,
  `iso_code` varchar(5) NOT NULL,
  `phone_code` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `country` (`country`),
  UNIQUE KEY `nationality` (`nationality`),
  UNIQUE KEY `iso_code` (`iso_code`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;

-- Dumping data for table country: ~43 rows (approximately)
/*!40000 ALTER TABLE `country` DISABLE KEYS */;
INSERT INTO `country` (`country`, `nationality`, `iso_code`, `phone_code`) VALUES
  ('USA', 'American', 'US', '1'),
  ('United Kingdom', 'British', 'GB', '44'),
  ('England', 'English', 'ENG', '44'),
  ('Scotland', 'Scottish', 'SCO', '44'),
  ('Wales', 'Welsh', 'WAL', '44'),
  ('Australia', 'Australian', 'AU', '61'),
  ('Austria', 'Austrian', 'AT', '43'),
  ('Belgium', 'Belgian', 'BE', '32'),
  ('Brazil', 'Brazilian', 'BR', '55'),
  ('Chile', 'Chilean', 'CL', '56'),
  ('China', 'Chinese', 'CN', '86'),
  ('Colombia', 'Colombian', 'CO', '57'),
  ('Costa Rica', 'Costa Rican', 'CR', '506'),
  ('Croatia (Hrvatska)', 'Croatia (Hrvatska)', 'HR', '385'),
  ('Czech Republic', 'Czech', 'CZ', '420'),
  ('Denmark', 'Denmark', 'DK', '45'),
  ('Ecuador', 'Ecuadorean', 'EC', '593'),
  ('Estonia', 'Estonian', 'EE', '372'),
  ('France', 'French', 'FR', '33'),
  ('Germany', 'German', 'DE', '49'),
  ('Honduras', 'Honduran', 'HN', '504'),
  ('Hungary', 'Hungarian', 'HU', '36'),
  ('Ireland', 'Irish', 'IE', '353'),
  ('Israel', 'Isreali', 'IL', '972'),
  ('Italy', 'Italian', 'IT', '39'),
  ('Japan', 'Japanese', 'JP', '81'),
  ('Kazakhstan', 'Kazakhstani', 'KZ', '7'),
  ('Korea South', 'Korea South', 'KR', '82'),
  ('Latvia', 'Latvian', 'LV', '371'),
  ('Mexico', 'Mexican', 'MX', '52'),
  ('Netherlands', 'Netherlands The', 'NL', '31'),
  ('Norway', 'Norwegian', 'NO', '47'),
  ('Poland', 'Polish', 'PL', '48'),
  ('Portugal', 'Portugese', 'PT', '351'),
  ('Romania', 'Romanian', 'RO', '40'),
  ('Russia', 'Russian', 'RU', '70'),
  ('Singapore', 'Singaporean', 'SG', '65'),
  ('Slovakia', 'Slovakia', 'SK', '421'),
  ('Slovenia', 'Slovenian', 'SI', '386'),
  ('South Africa', 'South African', 'ZA', '27'),
  ('Spain', 'Spanish', 'ES', '34'),
  ('Sweden', 'Sweden', 'SE', '46'),
  ('Switzerland', 'Switzerland', 'CH', '41');
/*!40000 ALTER TABLE `country` ENABLE KEYS */;


-- Dumping structure for table league
CREATE TABLE IF NOT EXISTS `league` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `_key` varchar(63) DEFAULT NULL,
  `name` varchar(127) DEFAULT NULL,
  `id_country` int(10) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;

-- Dumping data for table league: ~18 rows (approximately)
/*!40000 ALTER TABLE `league` DISABLE KEYS */;
INSERT INTO `league` (`_key`, `name`, `id_country`, `status`) VALUES
  ('EPL', 'English Premier League', 3, 1),
  ('EngChamp', 'Championship', 3, 1),
  ('BraSerieA', 'Serie A', 9, 1),
  ('LaLiga', 'La Liga', 41, 1),
  ('ItaSerieA', 'Serie A', 25, 1),
  ('ItaSerieB', 'Serie B', 25, 1),
  ('FraLigue1', 'Ligue 1', 19, 1),
  ('FraLigue2', 'Ligue 2', 19, 1),
  ('GerBundesliga', 'Bundesliga', 20, 1),
  ('Ger2Bundesliga', '2.Bundesliga', 20, 1),
  ('MLS', 'Major League Soccer', 1, 1),
  ('ScoPremier', 'Premier League', 4, 1),
  ('BraSerieB', 'Serie B', 9, 1),
  ('NetEredivisie', 'Eredivisie', 31, 1),
  ('NetErsteDivisie', 'Erste Divisie', 31, 1),
  ('HunOTPBankLiga', 'OTP Bank Liga', 22, 1),
  ('JpnJLeague', 'J League', 26, 1),
  ('WelshPremier', 'Welsh Premier League', 5, 1);
/*!40000 ALTER TABLE `league` ENABLE KEYS */;


-- Dumping structure for table matches
CREATE TABLE IF NOT EXISTS `matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;

-- Dumping data for table matches: ~0 rows (approximately)
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
INSERT INTO `matches` (`season`, `id_club_1`, `id_club_2`, `id_league`, `date`, `time`, `status`, `id_stadium`) VALUES
  ('2017 / 2018', 6, 9, 1, '2018-05-16', '14:00:00', 0, 0),
  ('2018 / 2019', 8, 3, 1, '2018-10-29', '10:00:00', 0, 0),
  ('2018 / 2019', 1, 2, 1, '2018-02-02', '17:00:00', 0, 0),
  ('2017 / 2018', 24, 22, 5, '2017-10-10', '19:45:00', 0, 0),
  ('2018 / 2019', 4, 5, 1, '2018-10-30', '03:00:00', 0, 0),
  ('2018 / 2019', 20, 7, 1, '2018-10-30', '15:00:00', 0, 0),
  ('2018 / 2019', 15, 12, 1, '2018-10-31', '16:00:00', 0, 0),
  ('2018 / 2019', 18, 10, 1, '2018-11-04', '13:30:00', 0, 0),
  ('2018 / 2019', 25, 23, 7, '2018-11-04', '12:45:00', 0, 0),
  ('2018 / 2019', 28, 27, 4, '2018-11-04', '19:45:00', 0, 0),
  ('2018 / 2019', 26, 29, 4, '2018-11-10', '19:45:00', 0, 0),
  ('2018 / 2019', 16, 19, 1, '2018-11-11', '16:00:00', 0, 0),
  ('2017 / 2018', 31, 30, 7, '2018-01-23', '16:00:00', 0, 0);
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;


-- Dumping structure for table ticket
CREATE TABLE IF NOT EXISTS `ticket` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `stake` float NOT NULL,
  `status` tinyint(1) NOT NULL COMMENT '0-Pending; 1-Active; 2-Done',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;

-- Dumping data for table ticket: ~10 rows (approximately)
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
INSERT INTO `ticket` (`name`, `stake`, `status`) VALUES
  ('Combo', 50, 0),
  ('XMen', 100, 0),
  ('Suite1', 50, 0),
  ('Kdjol', 50, 0),
  ('Tesla', 50, 0),
  ('aisles', 50, 0),
  ('Jumbo', 50, 0),
  ('Nett', 50, 0),
  ('Denva', 50, 0),
  ('Kramer', 200, 0);
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
