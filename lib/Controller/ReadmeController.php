<?php
namespace OCA\MarkdownReadme\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http;
use OCP\IRequest;
use OCA\MarkdownReadme\Service\ReadmeService;

class ReadmeController extends Controller {

    private ReadmeService $service;

    public function __construct(
        string $AppName,
        IRequest $request,
        ReadmeService $service
    ) {
        parent::__construct($AppName, $request);
        $this->service = $service;
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function get(string $path = '/'): DataResponse {
        if (empty($path)) {
            return new DataResponse(['exists' => false], Http::STATUS_BAD_REQUEST);
        }

        $result = $this->service->getReadme($path);

        if (isset($result['error']) && $result['error'] === 'Not authenticated') {
            return new DataResponse($result, Http::STATUS_UNAUTHORIZED);
        }

        return new DataResponse($result);
    }
}
