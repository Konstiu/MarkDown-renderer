<?php
namespace OCA\MarkdownReadme\AppInfo;

use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\EventDispatcher\IEventDispatcher;
use OCA\Files\Event\LoadAdditionalScriptsEvent;

class Application extends App implements IBootstrap {

    public const APP_ID = 'markdownreadme';

    public function __construct(array $urlParams = []) {
        parent::__construct(self::APP_ID, $urlParams);
    }

    public function register(IRegistrationContext $context): void {
        // Services are auto-wired via DI, nothing extra needed here
    }

    public function boot(IBootContext $context): void {
        $context->injectFn(function (IEventDispatcher $dispatcher): void {
            // Load our JS and CSS when the Files app loads its scripts
            $dispatcher->addListener(LoadAdditionalScriptsEvent::class, function (): void {
                \OCP\Util::addScript(self::APP_ID, 'readme');
                \OCP\Util::addStyle(self::APP_ID, 'readme');
            });
        });
    }
}
