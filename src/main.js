const { SigningCosmWasmClient } = require("secretjs");
const chainId = "secret-3";

const textEncoding = require('text-encoding');
const TextDecoder = textEncoding.TextDecoder;

var secretJs;
var accounts;

window.onload = async () => {
    // Keplr extension injects the offline signer that is compatible with secretJS.
    // You can get this offline signer from `window.getOfflineSigner(chainId:string)` after load event.
    // And it also injects the helper function to `window.keplr`.
    // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.
    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please install keplr extension");
    }

    // You should request Keplr to enable the wallet.
    // This method will ask the user whether or not to allow access if they haven't visited this website.
    // Also, it will request user to unlock the wallet if the wallet is locked.
    // If you don't request enabling before usage, there is no guarantee that other methods will work.
    await window.keplr.enable(chainId);

    const offlineSigner = window.getOfflineSigner(chainId);
	const enigmaUtils = window.getEnigmaUtils(chainId);

    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningCosmosClient.
    // Save it to the window variable
    accounts = await offlineSigner.getAccounts();
	

    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    // Save it to the window variable
	secretJS = new SigningCosmWasmClient(
		"https://lcd.scrt-archive.xiphiar.com",
		accounts[0].address,
		offlineSigner,
		enigmaUtils
	);

    document.getElementById("address").append(accounts[0].address);
};

document.sendForm.onsubmit = () => {
    let txHash = document.sendForm.txhash.value;

    (async () => {

        let decrypted = await secretJS.restClient.txById(txHash, true);
        //delete decrypted.data;
        decrypted.data = new TextDecoder().decode(decrypted.data);
        let pretty = JSON.stringify(decrypted, undefined, 2);
        document.getElementById('execmsg').innerHTML = `<pre>${pretty}</pre>`;
        //decrypted.tx.value.msg[0].msg=atob(decrypted.tx.value.msg[0].msg);

        //console.log(decrypted);


    })();

    return false;
};
