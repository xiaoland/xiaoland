CREATE TABLE IF NOT EXISTS `xenix_download_users` (
  `email` text,
  `phone` text,
  `created_at` integer,
  CONSTRAINT `xenix_download_users_contact_check`
    CHECK (`email` IS NOT NULL OR `phone` IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS `xenix_download_users_email_unique`
ON `xenix_download_users` (`email`);

CREATE UNIQUE INDEX IF NOT EXISTS `xenix_download_users_phone_unique`
ON `xenix_download_users` (`phone`);
