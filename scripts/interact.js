const { ethers } = require("hardhat");

async function main() {
  // Read deployment info
  const fs = require('fs');
  let deploymentInfo;

  try {
    const deploymentData = fs.readFileSync('./deployment-info.json', 'utf8');
    deploymentInfo = JSON.parse(deploymentData);
  } catch (error) {
    console.error("Could not find deployment info. Please deploy the token first.");
    console.log("Run: npx hardhat run scripts/deploy.js --network <network>");
    return;
  }

  console.log("GenericToken Interaction Script");
  console.log("Token Address:", deploymentInfo.tokenAddress);

  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  // Get contract instance
  const GenericToken = await ethers.getContractFactory("GenericToken");
  const token = GenericToken.attach(deploymentInfo.tokenAddress);

  try {
    // Display current state
    console.log("\nCurrent Token State:");
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    const maxSupply = await token.maxSupply();
    const owner = await token.owner();
    const paused = await token.paused();
    const emergencyMode = await token.emergencyMode();

    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Total Supply:", ethers.utils.formatUnits(totalSupply, 18), "tokens");
    console.log("  Max Supply:", ethers.utils.formatUnits(maxSupply, 18), "tokens");
    console.log("  Owner:", owner);
    console.log("  Paused:", paused);
    console.log("  Emergency Mode:", emergencyMode);

    // Check signer info
    console.log("\nSigner Information:");
    const balance = await token.balanceOf(signer.address);
    const isMinter = await token.isMinter(signer.address);
    const isBlacklisted = await token.isBlacklisted(signer.address);
    const dailyMinted = await token.dailyMinted();
    const remainingDailyLimit = await token.remainingDailyLimit();

    console.log("  Balance:", ethers.utils.formatUnits(balance, 18), "tokens");
    console.log("  Is Minter:", isMinter);
    console.log("  Is Blacklisted:", isBlacklisted);
    console.log("  Daily Minted:", ethers.utils.formatUnits(dailyMinted, 18), "tokens");
    console.log("  Remaining Daily Limit:", ethers.utils.formatUnits(remainingDailyLimit, 18), "tokens");

    // Get command from user (or use process.argv for automation)
    const command = process.argv[2];

    if (!command) {
      console.log("\nAvailable Commands:");
      console.log("  mint <amount> <address> - Mint tokens (minter only)");
      console.log("  transfer <amount> <address> - Transfer tokens");
      console.log("  approve <amount> <address> - Approve spending");
      console.log("  burn <amount> - Burn tokens");
      console.log("  pause - Pause token transfers");
      console.log("  unpause - Unpause token transfers");
      console.log("  addMinter <address> - Add a new minter");
      console.log("  removeMinter <address> - Remove a minter");
      console.log("  blacklist <address> - Blacklist an address");
      console.log("  unblacklist <address> - Remove from blacklist");
      console.log("  emergency - Toggle emergency mode");
      console.log("  permit-demo - Demonstrate EIP-2612 permit functionality");
      return;
    }

    // Execute command
    switch (command.toLowerCase()) {
      case 'mint':
        if (process.argv[3] && process.argv[4]) {
          const amount = ethers.utils.parseUnits(process.argv[3], 18);
          const to = process.argv[4];
          console.log(`\nMinting ${ethers.utils.formatUnits(amount, 18)} tokens to ${to}...`);
          const tx = await token.mint(to, amount);
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Tokens minted successfully!");
        } else {
          console.log("Usage: mint <amount> <address>");
        }
        break;

      case 'transfer':
        if (process.argv[3] && process.argv[4]) {
          const amount = ethers.utils.parseUnits(process.argv[3], 18);
          const to = process.argv[4];
          console.log(`\nTransferring ${ethers.utils.formatUnits(amount, 18)} tokens to ${to}...`);
          const tx = await token.transfer(to, amount);
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Tokens transferred successfully!");
        } else {
          console.log("Usage: transfer <amount> <address>");
        }
        break;

      case 'approve':
        if (process.argv[3] && process.argv[4]) {
          const amount = ethers.utils.parseUnits(process.argv[3], 18);
          const spender = process.argv[4];
          console.log(`\nApproving ${ethers.utils.formatUnits(amount, 18)} tokens for ${spender}...`);
          const tx = await token.approve(spender, amount);
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Approval successful!");
        } else {
          console.log("Usage: approve <amount> <address>");
        }
        break;

      case 'burn':
        if (process.argv[3]) {
          const amount = ethers.utils.parseUnits(process.argv[3], 18);
          console.log(`\nBurning ${ethers.utils.formatUnits(amount, 18)} tokens...`);
          const tx = await token.burn(amount);
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Tokens burned successfully!");
        } else {
          console.log("Usage: burn <amount>");
        }
        break;

      case 'pause':
        console.log("\nPausing token transfers...");
        const pauseTx = await token.pause();
        console.log("Transaction hash:", pauseTx.hash);
        console.log("Waiting for confirmation...");
        await pauseTx.wait();
        console.log("Token transfers paused!");
        break;

      case 'unpause':
        console.log("\nUnpausing token transfers...");
        const unpauseTx = await token.unpause();
        console.log("Transaction hash:", unpauseTx.hash);
        console.log("Waiting for confirmation...");
        await unpauseTx.wait();
        console.log("Token transfers unpaused!");
        break;

      case 'addminter':
        if (process.argv[3]) {
          const minter = process.argv[3];
          console.log(`\nAdding ${minter} as minter...`);
          const tx = await token.addMinter(minter);
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Minter added successfully!");
        } else {
          console.log("Usage: addMinter <address>");
        }
        break;

      case 'removeminter':
        if (process.argv[3]) {
          const minter = process.argv[3];
          console.log(`\nRemoving ${minter} as minter...`);
          const tx = await token.removeMinter(minter);
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Minter removed successfully!");
        } else {
          console.log("Usage: removeMinter <address>");
        }
        break;

      case 'blacklist':
        if (process.argv[3]) {
          const address = process.argv[3];
          console.log(`\nBlacklisting ${address}...`);
          const tx = await token.blacklist(address);
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Address blacklisted successfully!");
        } else {
          console.log("Usage: blacklist <address>");
        }
        break;

      case 'unblacklist':
        if (process.argv[3]) {
          const address = process.argv[3];
          console.log(`\nRemoving ${address} from blacklist...`);
          const tx = await token.unblacklist(address);
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Address removed from blacklist!");
        } else {
          console.log("Usage: unblacklist <address>");
        }
        break;

      case 'emergency':
        const currentEmergencyMode = await token.emergencyMode();
        if (currentEmergencyMode) {
          console.log("\nDeactivating emergency mode...");
          const tx = await token.deactivateEmergencyMode();
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Emergency mode deactivated!");
        } else {
          console.log("\nActivating emergency mode...");
          const tx = await token.activateEmergencyMode();
          console.log("Transaction hash:", tx.hash);
          console.log("Waiting for confirmation...");
          await tx.wait();
          console.log("Emergency mode activated!");
        }
        break;

      case 'permit-demo':
        await demonstratePermit(token, signer);
        break;

      default:
        console.log("Unknown command:", command);
    }

  } catch (error) {
    console.error("Error executing command:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

async function demonstratePermit(token, signer) {
  console.log("\nEIP-2612 Permit Demo");

  const [recipient] = await ethers.getSigners();
  const spender = await ethers.getSigners(1);

  if (!spender) {
    console.log("Need at least 2 accounts for permit demo");
    return;
  }

  const amount = ethers.utils.parseUnits("100", 18);
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  console.log("Permit Details:");
  console.log("  Owner:", signer.address);
  console.log("  Spender:", spender.address);
  console.log("  Amount:", ethers.utils.formatUnits(amount, 18), "tokens");
  console.log("  Deadline:", new Date(deadline * 1000).toISOString());

  try {
    // Get the nonce
    const nonce = await token.nonces(signer.address);
    console.log("  Nonce:", nonce.toString());

    // Get domain separator
    const domainSeparator = await token.DOMAIN_SEPARATOR();
    console.log("  Domain Separator:", domainSeparator);

    // Create the permit message
    const permitMessage = {
      owner: signer.address,
      spender: spender.address,
      value: amount,
      nonce: nonce,
      deadline: deadline
    };

    // Sign the permit
    const signature = await signer._signTypedData(
      {
        name: await token.name(),
        version: "1",
        chainId: await signer.getChainId(),
        verifyingContract: token.address
      },
      {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" }
        ]
      },
      permitMessage
    );

    const { v, r, s } = ethers.utils.splitSignature(signature);

    console.log("Signature Generated:");
    console.log("  v:", v);
    console.log("  r:", r);
    console.log("  s:", s);

    // Check allowance before permit
    const allowanceBefore = await token.allowance(signer.address, spender.address);
    console.log("Allowance before permit:", ethers.utils.formatUnits(allowanceBefore, 18));

    // Execute permit
    console.log("\nExecuting permit...");
    const permitTx = await token.connect(spender).permit(
      signer.address,
      spender.address,
      amount,
      deadline,
      v, r, s
    );

    console.log("Transaction hash:", permitTx.hash);
    console.log("Waiting for confirmation...");
    await permitTx.wait();

    // Check allowance after permit
    const allowanceAfter = await token.allowance(signer.address, spender.address);
    console.log("Allowance after permit:", ethers.utils.formatUnits(allowanceAfter, 18));

    // Test the permit by transferring tokens
    console.log("\nTesting permit by transferring tokens...");
    const transferTx = await token.connect(spender).transferFrom(signer.address, spender.address, amount);
    console.log("Transaction hash:", transferTx.hash);
    console.log("Waiting for confirmation...");
    await transferTx.wait();

    console.log("Permit demo completed successfully!");

  } catch (error) {
    console.error("Permit demo failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });