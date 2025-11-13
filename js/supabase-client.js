// Supabase client and database operations

let supabaseClient;

// Initialize Supabase client
function initSupabase() {
  if (typeof SUPABASE_CONFIG === 'undefined') {
    console.error('Supabase config not found. Please create config.js with your Supabase credentials.');
    return false;
  }

  try {
    supabaseClient = supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
    console.log('Supabase client initialized');
    return true;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return false;
  }
}

// Fetch game data for a specific arcade machine
async function getMachineData(machineNumber) {
  try {
    const { data, error } = await supabaseClient
      .from('arcade_machines')
      .select('*')
      .eq('machine_number', machineNumber)
      .single();

    if (error) {
      // If no record exists, that's okay - machine is empty
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching machine data:', error);
    return null;
  }
}

// Add or update game data for an arcade machine
async function saveMachineData(machineNumber, gameTitle, studentName, gameLink) {
  try {
    const { data, error } = await supabaseClient
      .from('arcade_machines')
      .upsert({
        machine_number: machineNumber,
        game_title: gameTitle,
        student_name: studentName,
        game_link: gameLink,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'machine_number'
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error saving machine data:', error);
    throw error;
  }
}

// Remove game data from an arcade machine
async function removeMachineData(machineNumber) {
  try {
    const { error } = await supabaseClient
      .from('arcade_machines')
      .delete()
      .eq('machine_number', machineNumber);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error removing machine data:', error);
    throw error;
  }
}

// Fetch all arcade machines (useful for future features)
async function getAllMachines() {
  try {
    const { data, error } = await supabaseClient
      .from('arcade_machines')
      .select('*')
      .order('machine_number');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching all machines:', error);
    return [];
  }
}

// Initialize on load
initSupabase();
