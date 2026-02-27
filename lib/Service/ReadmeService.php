<?php
namespace OCA\MarkdownReadme\Service;

use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\IUserSession;

class ReadmeService {

    private IRootFolder $rootFolder;
    private IUserSession $userSession;

    public function __construct(IRootFolder $rootFolder, IUserSession $userSession) {
        $this->rootFolder = $rootFolder;
        $this->userSession = $userSession;
    }

    public function getReadme(string $path): array {
        // Guard: user must be logged in
        $user = $this->userSession->getUser();
        if ($user === null) {
            return ['exists' => false, 'error' => 'Not authenticated'];
        }

        // Guard: prevent path traversal attempts
        $normalizedPath = rtrim($path, '/');
        if (str_contains($normalizedPath, '..')) {
            return ['exists' => false, 'error' => 'Invalid path'];
        }

        try {
            $userFolder = $this->rootFolder->getUserFolder($user->getUID());
            $file = $userFolder->get($normalizedPath . '/README.md');

            // Make sure it's actually a file, not a folder
            if (!($file instanceof \OCP\Files\File)) {
                return ['exists' => false];
            }

            $content = $file->getContent();
            return ['exists' => true, 'content' => $content];

        } catch (NotFoundException $e) {
            return ['exists' => false];
        } catch (\Exception $e) {
            return ['exists' => false, 'error' => 'Unexpected error'];
        }
    }
}
