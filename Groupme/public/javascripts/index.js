document.getElementById('autocomplete').addEventListener('input', function() {
    var input = this.value;
    if (input.length > 0) {
        fetch(`/autocomplete?q=${encodeURIComponent(input)}`)
            .then(response => response.json())
            .then(data => { 
                const suggestionsList = document.getElementById('suggestions');
                suggestionsList.innerHTML = ''; // Clear previous suggestions
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    suggestionsList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching suggestions:', error));
    } else {
        document.getElementById('suggestions').innerHTML = ''; // Clear suggestions if input is empty
    }
});