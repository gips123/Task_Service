-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 10, 2025 at 12:30 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `uas_service`
--

-- --------------------------------------------------------

--
-- Table structure for table `distraction_blacklist`
--

CREATE TABLE `distraction_blacklist` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `app_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `distraction_blacklist`
--

INSERT INTO `distraction_blacklist` (`id`, `user_id`, `app_name`) VALUES
(1, 1, 'YouTube'),
(2, 1, 'TikTok'),
(3, 1, 'Twitter / X');

-- --------------------------------------------------------

--
-- Table structure for table `distraction_logs`
--

CREATE TABLE `distraction_logs` (
  `id` int NOT NULL,
  `task_id` int DEFAULT NULL,
  `app_name` varchar(100) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `duration_seconds` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `distraction_logs`
--

INSERT INTO `distraction_logs` (`id`, `task_id`, `app_name`, `start_time`, `end_time`, `duration_seconds`) VALUES
(1, 2, 'Chrome: YouTube', '2025-12-08 09:15:00', '2025-12-08 09:25:00', 600),
(2, 2, 'TikTok App', '2025-12-08 10:40:00', '2025-12-08 10:45:00', 300);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `category` enum('emergency','family','home','personal','social','work') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `duration_estimation` int NOT NULL,
  `deadline` datetime DEFAULT NULL,
  `start_schedule` datetime DEFAULT NULL,
  `end_schedule` datetime DEFAULT NULL,
  `sequence_order` int DEFAULT NULL,
  `start_actual` datetime DEFAULT NULL,
  `end_actual` datetime DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed','Overdue') DEFAULT 'Pending',
  `delay_minutes` int DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `user_id`, `description`, `category`, `priority`, `duration_estimation`, `deadline`, `start_schedule`, `end_schedule`, `sequence_order`, `start_actual`, `end_actual`, `status`, `delay_minutes`, `is_locked`) VALUES
(1, 1, 'Selesaikan Bab 1 Skripsi', 'work', 'High', 240, '2025-12-11 23:59:00', NULL, NULL, NULL, NULL, NULL, 'Pending', 0, 0),
(2, 1, 'Balas Email Darurat Klien X', 'emergency', 'High', 30, '2025-12-08 23:00:00', NULL, NULL, NULL, NULL, NULL, 'Pending', 0, 1),
(3, 1, 'Beli Kebutuhan Mingguan', 'personal', 'Low', 60, '2025-12-17 18:00:00', NULL, NULL, NULL, NULL, NULL, 'Pending', 0, 0),
(4, 1, 'Pelajari Framework FastAPI', 'work', 'Medium', 180, '2025-12-13 09:00:00', NULL, NULL, NULL, NULL, NULL, 'Pending', 0, 0),
(5, 1, 'repair home appliances', 'home', 'High', 60, '2025-12-10 23:00:00', NULL, NULL, NULL, NULL, NULL, 'Pending', 0, 1),
(6, 1, 'repair home appliances', 'home', 'High', 60, '2025-12-11 23:00:00', NULL, NULL, NULL, NULL, NULL, 'Pending', 0, 1),
(7, 1, 'repair home appliances', 'home', 'High', 60, '2025-12-11 23:00:00', NULL, NULL, NULL, NULL, NULL, 'Pending', 0, 1),
(8, 2, 'repair home appliances', 'home', 'High', 60, '2025-12-11 23:00:00', NULL, NULL, NULL, NULL, NULL, 'Pending', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `provider` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `provider`, `password_hash`, `created_at`) VALUES
(1, 'Andi Nugraha', 'andi.nugraha@mail.com', 'Google', NULL, '2025-12-08 14:55:35'),
(2, 'Budi Santoso', 'budi.santoso@mail.com', 'EmailPassword', '$2b$12$R2D.0jGf0pZ2yH7A2bWwD.', '2025-12-08 14:55:35');

-- --------------------------------------------------------

--
-- Table structure for table `working_slots`
--

CREATE TABLE `working_slots` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `working_days` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','All Day') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `working_slots`
--

INSERT INTO `working_slots` (`id`, `user_id`, `start_time`, `end_time`, `working_days`) VALUES
(1, 1, '08:00:00', '12:00:00', 'All Day'),
(2, 1, '13:00:00', '17:00:00', 'All Day');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `distraction_blacklist`
--
ALTER TABLE `distraction_blacklist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `distraction_logs`
--
ALTER TABLE `distraction_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_email_provider` (`email`,`provider`);

--
-- Indexes for table `working_slots`
--
ALTER TABLE `working_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `distraction_blacklist`
--
ALTER TABLE `distraction_blacklist`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `distraction_logs`
--
ALTER TABLE `distraction_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `working_slots`
--
ALTER TABLE `working_slots`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `distraction_blacklist`
--
ALTER TABLE `distraction_blacklist`
  ADD CONSTRAINT `distraction_blacklist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `distraction_logs`
--
ALTER TABLE `distraction_logs`
  ADD CONSTRAINT `distraction_logs_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `working_slots`
--
ALTER TABLE `working_slots`
  ADD CONSTRAINT `working_slots_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
