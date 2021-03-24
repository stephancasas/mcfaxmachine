# McFaxMachine

A macOS/Linux utility for printing incoming e-mail messages... like a fax machine.

## Why?

Apparently, retail stores, bakeries, and other fulfillment centers regularly use printed orders — many of which arrive first via e-mail after an order is placed through Shopify, WooCommerce, etc.

A client asked for this functionality, and AppleScript just wasn't cutting it.

> **Will this work on Windows?**
> 
> Unfortunately, not. McFaxMachine uses the [CUPS](https://www.cups.org) command, `lpr`, to enqueue messages once they're prepared for print. If there's a Windows equivalent, please feel free to fork the project and submit a pull request, or raise an issue with further detail.

## Install

### Configure

Before building the project, you must specify the configuration parameters in `src/config/config.ts`:

```ts
export default <ApplicationConfig>{

  //REQUIRED: standard IMAP connection parameters
  connection: {
    user: 'johnny.appleseed@example.com',
    password: 'mycoolpassword123',
    host: 'smtp.example.com',
    port: 993,
    tls: true
  },
  
  // REQUIRED: mailbox settings
  mailboxes: {
  
    // the mailbox from which messages will be printed
    inbox: 'INBOX',
    
    // the mailbox where messages will be sent after printing
    trash: 'INBOX.Trash'
  },
  
  // REQUIRED: in milliseconds, the interval at which to poll the IMAP server
  frequency: 300000, // advise no less than 300000 (five minutes)
  
  // REQUIRED: the path where rendered PDFs will be stored before printing
  workDir: '/tmp', // no trailing path separator char
  
  // OPTIONAL: the canonical name of the printer to use (uses default printer if undefined)
  // NOTE: if running daemonized in macOS, you must specify this value
  printer: 'BubbleJet_3100',

  // OPTIONAL: specify the `lpr` command used to queue the print
  // NOTE: see details below
  lprCommand: '/usr/bin/lpr -P "BubbleJet 3100" -o media=letter'
  
}
```

> **Why should I specify the `lpr` command?**
>
> If you've setup your system in such a way that `lpr` is not located in the default location, `/usr/bin/lpr`, you will need to tell McFaxMachine where to find the command. 
>
> More importantly, if you're running McFaxMachine daemonized using `launchd`, the macOS `root` user under which `lpr` will be executed does not have a default printer and thus does not have default print settings that may have been specified by the user.
> 
> While CUPS will supply a set of default options on printer setup, these options will often differ from those given by a system print dialogue and may trip an error routine in some printers — causing the job to stall or require user confirmation at the printer via a button press. Using the `-o` switch with `lpr` allows you to specify job options such as paper type, collating, etc.
>
> For more information on available job options, consult the [lpr man pages](https://man7.org/linux/man-pages/man1/lpr.1.html) online or by running `man lpr` from your terminal session.

### Build

**Install the required dependencies:**

```sh
npm install --also=dev
```

**Build the project:**

```sh
npm run build
```

## Usage

### Attached/Ephemeral Execution

If your intention is to run McFaxMachine on an ephemeral basis, you can execute `npm start` to instantiate the process from the terminal — killing it with `^C` when done.

However, odds are good that you're looking for a background service, so in this case you'll want to make use of `launchd` to keep McFaxMachine running detatched, behind the scenes.

### Detatched/Background Execution

To use McFaxMachine without needing to keep a Terminal window open, you can use the `launchctl` command along with a `com.stephancasas.mcfaxmachine.plist` file to let `launchd` handle execution.

#### PLIST Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>KeepAlive</key>
	<true/>
	<key>RunAtLoad</key>
	<true/>
	<key>Label</key>
	<string>com.stephancasas.mcfaxmachine</string>
	<key>Program</key>
	<string>/usr/local/bin/node</string>
	<key>ProgramArguments</key>
	<array>
	    <string>/usr/local/bin/node</string>
		<string>/opt/com.stephancasas.mcfaxmachine/server.js</string>
	</array>
	<key>StandardOutPath</key>
	<string>/opt/com.stephancasas.mcfaxmachine/launchdOutput.log</string>
	<key>StandardErrorPath</key>
	<string>/opt/com.stephancasas.mcfaxmachine/launchdError.log</string>
</dict>
</plist>
```

The `.plist` file provided in both this README as well as in the project root assume the following:

1. You have built the project according the the Build instructions in this README.
2. You have moved the contents of `dist/` into the `/opt/com.stephancasas.mcfaxmachine` directory.
3. You have moved the contents of `node_modules` into the `/opt/com.stephancasas.mcfaxmachine/node_modules` directory.
4. You have installed nodejs in `/usr/local/bin` or have created an equivalent symlink.
5. You have placed `com.stephancasas.mcfaxmachine.plist` in the `/Library/LaunchDaemons` directory.
6. You have assigned the required permissions to `com.stephancasas.mcfaxmachine.plist`.
    * The easy solution to this is to context-click the `/Library/LaunchDaemons` directory in Finder, select *"Get Info"*, and then choose the *"Apply to enclosed items..."* option from the gear menu beneath the *"Sharing and Permissions"* settings.

> **Why is nodejs given in both the `Program` and `ProgramArguments` stanzas?**
> 
> I don't know. It wouldn't work until I made this change. If you have an answer, please let me know.

#### Loading with `launchctl`

To permanently start McFaxMachine and run it in the background, execute the `launchctl` command:

```sh
launchctl load -w /Library/LaunchDaemons/com.stephancasas.mcfaxmachine.plist
```

Once started, you can send a test e-mail and check the logs stored in `/opt/com.stephancasas.mcfaxmachine` to see output from McFaxMachine.

## A Note From the Developer

Thanks for using McFaxMachine. If you use McFaxMachine for business, and it saves you time/money, please consider checking-out [Presto](https://github.com/stephancasas/presto), and becoming a sponsor for that project.

## License

MIT