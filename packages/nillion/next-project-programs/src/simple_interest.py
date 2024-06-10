from nada_dsl import *

def nada_main():
    # Define the parties involved in the computation
    party1 = Party(name="Party1")  # Party1 provides the principal amount
    party2 = Party(name="Party2")  # Party2 provides the rate of interest
    party3 = Party(name="Party3")  # Party3 provides the time period

    # Create secret integers for each party's input
    principal = SecretInteger(Input(name="principal", party=party1))
    rate = SecretInteger(Input(name="rate", party=party2))
    time = SecretInteger(Input(name="time", party=party3))

    # Optional: Create a public integer for demonstration (not needed in SI calculation)
    # public_int = PublicInteger(Input(name="public_int"))

    # Perform the Simple Interest (SI) calculation
    # SI formula: SI = (P * R * T) / 100

    # Step 1: Multiply principal (P) and rate (R)
    product_principal_rate = principal * rate

    # Step 2: Multiply the result by time (T)
    product_all = product_principal_rate * time

    # Step 3: Divide the result by 100 to get the Simple Interest
    si = product_all / PublicInteger(100)  # Assuming 100 is a public integer

    # For more complex scenarios, additional operations or transformations can be added

    # Return the computed Simple Interest (SI) as the output for Party1
    return [
        Output(si, "simple_interest", party1)
    ]

# Note: This code defines the structure and computation for the Nada program.
# It doesn't execute the program itself; execution would occur within the Nillion Network environment.

# Explanation of Components:
# - Party: Represents an entity involved in the computation.
# - SecretInteger: An integer input provided by a party, kept secret during computation.
# - Input: Defines an input parameter with a name and associated party.
# - PublicInteger: Represents a public integer value available to all parties.
# - Output: Defines an output parameter with a value, name, and associated party.
# - Arithmetic Operations: Standard operations (addition, subtraction, multiplication, division) are used to perform calculations on secret and public integers.
