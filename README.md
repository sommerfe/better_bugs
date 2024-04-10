# Better Bugs

A simple browser extension to help you create better bug reports.
No matter if you are a developer, tester, or user, you can use this extension to create a bug report containing a lot of useful information with one click.

Install it in your browser.
Click on the Better Bugs icon to open the extension.
Fill in a comment and push the button "Create Report" to create your bug report.

This report will include a screenshot of your current page, system information including the current URL, operating system, browser, and browser version.
Also the comment you entered will be included in the report.

If you want to add the network logs to the report, the network tab of the developer tools must be open before you click the "Create Report" button. To do this you can right-click on the page and select "Inspect" and select the network tab or press `Ctrl+Shift+I` , `Shift+F12` or `Cmd+Option+I` on Mac.
The network logs will be in the `HAR` format which can be easily imported in a browser or other tools.

## Tutorial

### Using the Firefox extension

#### Without HAR logs

1. Install the extension in your browser. You can find the extension in the [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/better-bugs/).
2. Navigate to the page where you found the bug. ![Website with bug](https://i.ibb.co/D7FSTkP/1.png)
3. Click on the Better Bugs icon in the toolbar to open the extension. Enter a comment if needed and then click on the button `Create Report`. ![Better Bugs open](https://i.ibb.co/h7nss7q/2.png)
4. The extension will create a report with a screenshot of the current page, system information, and the comment you entered and download it as a `.zip` file. ![Report](https://i.ibb.co/d4mQWQF/3.png)
5. The system information includes the current URL, operating system, browser, and browser version and some more informations. ![System information](https://i.ibb.co/cwbR4dL/4.png)

### With HAR logs

1. Follow the steps 1-2 from the previous section.
2. Open the netwok tab in the developer tools. You can do this by right-clicking on the page and selecting "Inspect" and then selecting the network tab or pressing `Ctrl+Shift+I` , `Shift+F12` or `Cmd+Option+I` on Mac. ![Network tab](https://i.ibb.co/wzLBBPm/5.png)
3. For easier use you can open the developer tools in a separate window by clicking on the three dots in the top right corner of the developer tools and selecting "Separate Window". ![Undock into separate window](https://i.ibb.co/YbXkR9T/6.png)
4. Now click on the button `Create Report` in the Better Bugs extension. ![Create Report](https://i.ibb.co/Kjs3cvK/7.png)
5. The extension will create a report with a screenshot of the current page, system information, the comment you entered, and the network logs in the `HAR` format and download it as a `.zip` file. ![Report with HAR logs](https://i.ibb.co/M5djbWx/8.png)
6. To import the network logs in a browser or other tools you can drag and drop the `.har` file in the tool or use the import function of the tool. ![Import HAR logs](https://i.ibb.co/s6qpmFk/9.png)
7. Having imported the network logs you can see all the requests made by the page and the responses received. ![Network logs](https://i.ibb.co/jghFJBb/10.png)
