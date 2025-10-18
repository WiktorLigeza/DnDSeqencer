const automationsDiv = document.getElementById('automations');
const addBtn = document.getElementById('addAutomation');
const logDiv = document.getElementById('logEntries');
const popup = document.getElementById('popup');

// Load automations on page load
document.addEventListener('DOMContentLoaded', loadAutomations);

addBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'automation';
  div.innerHTML = `
    <div class="automation-header">
      <input type="text" placeholder="Name" class="name">
      <label>Hit Mod:</label>
      <input type="number" placeholder="Hit mod" class="hit-mod" value="0">
      <button class="throw">🎲 Throw</button>
    </div>
    <div class="damage-section">
      <div class="damage-header">
        <label>Damage Dice Manager</label>
        <span class="damage-toggle">🔽</span>
      </div>
      <div class="damage-content">
        <div class="damage-rows" id="damage-rows-${Date.now()}">
          <div class="damage-row">
            <label>Rolls:</label>
            <input type="number" placeholder="Dice Count" class="dice-count" min="1" value="1">
            <label>Dice:</label>
            <input type="number" placeholder="Dice Sides" class="dice-sides" min="1" value="6">
            <label>Mod:</label>
            <input type="number" placeholder="Modifier" class="dice-mod" value="0">
            <button class="remove-dice-row">❌</button>
          </div>
        </div>
        <button class="add-dice-row">➕ Add Dice</button>
      </div>
    </div>
    <button class="remove-automation" style="background: #f44336; margin-top: 10px;">🗑️ Remove</button>
  `;
  automationsDiv.appendChild(div);

  setupDamageManager(div);
  setupCollapsible(div);
  div.querySelector('.throw').addEventListener('click', () => throwAttack(div));
  div.querySelector('.remove-automation').addEventListener('click', () => {
    div.remove();
    saveAutomations();
  });
  
  // Add change listeners for localStorage
  addChangeListeners(div);
  saveAutomations();
});

function setupCollapsible(automationDiv) {
  const damageHeader = automationDiv.querySelector('.damage-header');
  const damageContent = automationDiv.querySelector('.damage-content');
  const toggle = automationDiv.querySelector('.damage-toggle');

  damageHeader.addEventListener('click', () => {
    damageContent.classList.toggle('hidden');
    toggle.classList.toggle('collapsed');
  });
}

function addChangeListeners(automationDiv) {
  const inputs = automationDiv.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', saveAutomations);
  });
}

function saveAutomations() {
  const automations = [];
  document.querySelectorAll('.automation').forEach(div => {
    const name = div.querySelector('.name').value;
    const hitMod = div.querySelector('.hit-mod').value;
    const damageRows = [];
    
    div.querySelectorAll('.damage-row').forEach(row => {
      damageRows.push({
        count: row.querySelector('.dice-count').value,
        sides: row.querySelector('.dice-sides').value,
        mod: row.querySelector('.dice-mod').value
      });
    });
    
    const isCollapsed = div.querySelector('.damage-content').classList.contains('hidden');
    
    automations.push({ name, hitMod, damageRows, isCollapsed });
  });
  
  localStorage.setItem('dndAutomations', JSON.stringify(automations));
}

function loadAutomations() {
  const saved = localStorage.getItem('dndAutomations');
  if (!saved) return;
  
  const automations = JSON.parse(saved);
  automations.forEach(auto => {
    const div = document.createElement('div');
    div.className = 'automation';
    div.innerHTML = `
      <div class="automation-header">
        <input type="text" placeholder="Name" class="name" value="${auto.name || ''}">
        <label>Hit Mod:</label>
        <input type="number" placeholder="Hit mod" class="hit-mod" value="${auto.hitMod || 0}">
        <button class="throw">🎲 Throw</button>
      </div>
      <div class="damage-section">
        <div class="damage-header">
          <label>Damage Dice Manager</label>
          <span class="damage-toggle ${auto.isCollapsed ? 'collapsed' : ''}">🔽</span>
        </div>
        <div class="damage-content ${auto.isCollapsed ? 'hidden' : ''}">
          <div class="damage-rows" id="damage-rows-${Date.now()}">
            ${auto.damageRows.map(row => `
              <div class="damage-row">
                <label>Rolls:</label>
                <input type="number" placeholder="Dice Count" class="dice-count" min="1" value="${row.count || 1}">
                <label>Dice:</label>
                <input type="number" placeholder="Dice Sides" class="dice-sides" min="1" value="${row.sides || 6}">
                <label>Mod:</label>
                <input type="number" placeholder="Modifier" class="dice-mod" value="${row.mod || 0}">
                <button class="remove-dice-row">❌</button>
              </div>
            `).join('')}
          </div>
          <button class="add-dice-row">➕ Add Dice</button>
        </div>
      </div>
      <button class="remove-automation" style="background: #f44336; margin-top: 10px;">🗑️ Remove</button>
    `;
    automationsDiv.appendChild(div);

    setupDamageManager(div);
    setupCollapsible(div);
    div.querySelector('.throw').addEventListener('click', () => throwAttack(div));
    div.querySelector('.remove-automation').addEventListener('click', () => {
      div.remove();
      saveAutomations();
    });
    addChangeListeners(div);
  });
}

function setupDamageManager(automationDiv) {
  const damageSection = automationDiv.querySelector('.damage-section');
  const addDiceBtn = damageSection.querySelector('.add-dice-row');
  const damageRows = damageSection.querySelector('.damage-rows');

  addDiceBtn.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'damage-row';
    newRow.innerHTML = `
      <label>Rolls:</label>
      <input type="number" placeholder="Dice Count" class="dice-count" min="1" value="1">
      <label>Dice:</label>
      <input type="number" placeholder="Dice Sides" class="dice-sides" min="1" value="6">
      <label>Mod:</label>
      <input type="number" placeholder="Modifier" class="dice-mod" value="0">
      <button class="remove-dice-row">❌</button>
    `;
    damageRows.appendChild(newRow);

    newRow.querySelector('.remove-dice-row').addEventListener('click', () => {
      if (damageRows.children.length > 1) {
        newRow.remove();
        saveAutomations();
      }
    });
    
    addChangeListeners(newRow);
    saveAutomations();
  });

  // Setup remove buttons for existing rows
  damageSection.querySelectorAll('.remove-dice-row').forEach(btn => {
    btn.addEventListener('click', () => {
      if (damageRows.children.length > 1) {
        btn.parentElement.remove();
        saveAutomations();
      }
    });
  });
}

function throwAttack(div) {
  const name = div.querySelector('.name').value || 'Unnamed';
  const hitMod = parseInt(div.querySelector('.hit-mod').value) || 0;
  const damageRows = div.querySelectorAll('.damage-row');

  const ac = parseInt(prompt('Enemy Armour Class:'));
  const throws = parseInt(prompt('Number of throws:'));
  const advantage = confirm('With advantage?');

  let totalHits = 0;
  let totalMisses = 0;
  let totalDamage = 0;
  let nat1s = 0;
  let nat20s = 0;

  for (let i = 1; i <= throws; i++) {
    const roll1 = rollDie(20);
    const roll2 = advantage ? rollDie(20) : null;
    const hitRoll = advantage ? Math.max(roll1, roll2) : roll1;
    const totalHit = hitRoll + hitMod;

    let natType = null;
    if (hitRoll === 1) { natType = 'Natural 1'; nat1s++; }
    else if (hitRoll === 20) { natType = 'Natural 20'; nat20s++; }
    if (natType) showPopup(natType);

    const hitSuccess = (hitRoll === 20) || (totalHit >= ac);
    hitSuccess ? totalHits++ : totalMisses++;

    const hitText = `
      <span class="log-dice">d20:${hitRoll}</span> + 
      <span class="mod">${hitMod}</span> = <b>${totalHit}</b> → 
      <span class="${hitSuccess ? 'hit' : 'miss'}">${hitSuccess ? 'HIT' : 'MISS'}</span>
    `;
    log(`🎯 <b>${name}</b> [Roll ${i}] → ${hitText}`);

    if (hitSuccess) {
      const dmgDetails = rollDamageFromRows(damageRows);
      const totalDmg = dmgDetails.reduce((a, b) => a + b.sum, 0);
      totalDamage += totalDmg;

      let dmgMsg = dmgDetails
        .map(d => {
          const rolls = d.rolls.map(r => `<span class="log-dice">${r}</span>`).join(' + ');
          const modTxt = d.mod !== 0 ? 
            ` + <span class="mod">${d.mod > 0 ? '+' + d.mod : d.mod}</span>` : '';
          return `${rolls} (<b>${d.dice}</b>)${modTxt} = <b>${d.sum}</b>`;
        })
        .join(' | ');

      log(`💥 Damage → ${dmgMsg} → <b class="dmg-total">${totalDmg}</b>`, true);

      // crit double dmg
      if (hitRoll === 20) {
        const critDetails = rollDamageFromRows(damageRows);
        const critTotal = critDetails.reduce((a, b) => a + b.sum, 0);
        totalDamage += critTotal;
        log(`🔥 <b>CRIT!</b> extra damage roll: <b class="dmg-total">+${critTotal}</b>`, true);
      }
    }
  }

  // round summary
  const summary = `
    <div class="summary">
      <b>🧾 ${name} Summary:</b> 
      <span class="hit">Hits: ${totalHits}</span> | 
      <span class="miss">Misses: ${totalMisses}</span> | 
      <span class="dmg-total">Total Dmg: ${totalDamage}</span>
      ${nat1s > 0 ? `<span class="nat1"> NAT1 ×${nat1s}</span>` : ''}
      ${nat20s > 0 ? `<span class="nat20"> NAT20 ×${nat20s}</span>` : ''}
    </div>
  `;
  log(summary, true);
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDamageFromRows(damageRows) {
  const results = [];
  for (let row of damageRows) {
    const count = parseInt(row.querySelector('.dice-count').value) || 1;
    const sides = parseInt(row.querySelector('.dice-sides').value) || 6;
    const mod = parseInt(row.querySelector('.dice-mod').value) || 0;
    
    if (sides > 0 && count > 0) {
      const rolls = [];
      for (let i = 0; i < count; i++) rolls.push(rollDie(sides));
      const sum = rolls.reduce((a, b) => a + b, 0) + mod;
      results.push({ dice: `${count}d${sides}`, rolls, mod, sum });
    }
  }
  return results;
}

function rollDamageVerbose(seq) {
  const parts = seq.split('+');
  const results = [];
  for (let p of parts) {
    p = p.trim();
    if (!p) continue;
    const match = p.match(/(\d*)d(\d+)([+-]?\d+)?/);
    if (match) {
      const count = parseInt(match[1] || '1');
      const sides = parseInt(match[2]);
      const mod = parseInt(match[3] || '0');
      const rolls = [];
      for (let i = 0; i < count; i++) rolls.push(rollDie(sides));
      const sum = rolls.reduce((a, b) => a + b, 0) + mod;
      results.push({ dice: `${count}d${sides}`, rolls, mod, sum });
    }
  }
  return results;
}

function log(msg, success = false) {
  const entry = document.createElement('div');
  entry.className = `log-entry ${success ? 'hit' : ''}`;
  entry.innerHTML = msg;
  logDiv.appendChild(entry);
  logDiv.scrollTop = logDiv.scrollHeight;
}

function showPopup(msg) {
  popup.textContent = msg;
  popup.classList.remove('hidden');
  setTimeout(() => popup.classList.add('hidden'), 2000);
}
