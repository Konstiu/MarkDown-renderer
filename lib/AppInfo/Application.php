<?php

  declare(strict_types=1);

  namespace OCA\MarkdownReadme\AppInfo;

  use OCA\Files\Event\LoadAdditionalScriptsEvent;
  use OCP\AppFramework\App;
  use OCP\AppFramework\Bootstrap\IBootContext;
  use OCP\AppFramework\Bootstrap\IBootstrap;
  use OCP\AppFramework\Bootstrap\IRegistrationContext;
  use OCP\EventDispatcher\IEventDispatcher;
  use OCP\Util;

  class Application extends App implements IBootstrap {
  	public const APP_ID = 'markdownreadme';

  	public function __construct(array $urlParams = []) {
  		parent::__construct(self::APP_ID, $urlParams);
  	}

  	public function register(IRegistrationContext $context): void {
  	}

  	public function boot(IBootContext $context): void {
  		$context->injectFn(function (IEventDispatcher $dispatcher): void {
  			$dispatcher->addListener(LoadAdditionalScriptsEvent::class, function (): void {
  				Util::addScript(self::APP_ID, 'markdownreadme-readme');
  			});
  		});
  	}
  }
