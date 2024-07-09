from nada_dsl import *

def nada_main():
    party1 = Party(name="Party1")
    party2 = Party(name="Party2")
    party3 = Party(name="Party3")

    # Define the inputs for the secret integers
    secret_int1 = SecretInteger(Input(name="secret_int1", party=party1))
    secret_int2 = SecretInteger(Input(name="secret_int2", party=party2))

    # Perform multiplication
    result = secret_int1 * secret_int2

    # Return the result to party3
    return [Output(result, "multiplication_result", party3)]