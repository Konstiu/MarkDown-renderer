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
		$user = $this->userSession->getUser();
		if ($user === null) {
			return ['exists' => false, 'error' => 'Not authenticated'];
		}

		$normalizedPath = rtrim($path, '/');
		if ($normalizedPath === '') {
			$normalizedPath = '/';
		}

		// Guard: prevent path traversal attempts
		if (str_contains($normalizedPath, '..')) {
			return ['exists' => false, 'error' => 'Invalid path'];
		}

		// Candidate filenames (case variants + optional no-extension)
		$candidates = [
			'README.md',
			'Readme.md',
			'readme.md',
			'README.MD',
			'ReadMe.md',
			'README',
			'Readme',
			'readme',
		];

		try {
			$userFolder = $this->rootFolder->getUserFolder($user->getUID());

			// Resolve folder node for the given path
			$folder = $normalizedPath === '/' ? $userFolder : $userFolder->get($normalizedPath);
			if (!($folder instanceof \OCP\Files\Folder)) {
				return ['exists' => false];
			}

			foreach ($candidates as $name) {
				try {
					$node = $folder->get($name);
					if ($node instanceof \OCP\Files\File) {
						return [
							'exists' => true,
							'name' => $name,
							'content' => $node->getContent(),
						];
					}
				} catch (NotFoundException $e) {
					// try next
				}
			}

			return ['exists' => false];

		} catch (NotFoundException $e) {
			return ['exists' => false];
		} catch (\Exception $e) {
			return ['exists' => false, 'error' => 'Unexpected error'];
		}
	}
}
